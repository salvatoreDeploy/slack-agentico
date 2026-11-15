import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { DomainError } from './domain.error.js';
import { ErrorCode } from './error-code.js';
import { ValidationFailedError } from './validation-failed.error.js';

/** O mapa de código para status: mora só aqui (rule de erros da API). */
const ERROR_STATUS: Record<ErrorCode, number> = {
  validation_failed: 400,
  malformed_body: 400,
  payload_too_large: 413,
  not_found: 404,
  internal_error: 500,
};

/** Os erros de `HttpException` que o Nest lança por conta própria, pelo status. */
const HTTP_STATUS_CODE: Partial<Record<number, ErrorCode>> = {
  400: 'validation_failed',
  404: 'not_found',
  413: 'payload_too_large',
};

/** Os erros do leitor do corpo do Express, pelo `type` que ele grava no erro. */
const BODY_PARSER_CODE: Record<string, ErrorCode> = {
  'entity.parse.failed': 'malformed_body',
  'entity.too.large': 'payload_too_large',
};

const DETAIL: Record<ErrorCode, string> = {
  validation_failed: 'A requisição tem campos inválidos.',
  malformed_body: 'O corpo da requisição não é um JSON válido.',
  payload_too_large: 'O corpo da requisição é grande demais.',
  not_found: 'O recurso pedido não existe.',
  internal_error: 'Erro inesperado no servidor.',
};

interface Problem {
  code: ErrorCode;
  detail: string;
  errors?: ValidationFailedError['errors'];
}

/**
 * Traduz todo erro em `application/problem+json` (LLD, "Erros"). É o único lugar que monta
 * resposta de erro.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const problem = this.toProblem(exception);
    const status = ERROR_STATUS[problem.code];
    const response = host.switchToHttp().getResponse<Response>();
    response
      .status(status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title: STATUS_CODES[status],
        status,
        code: problem.code,
        detail: problem.detail,
        ...(problem.errors ? { errors: problem.errors } : {}),
      });
  }

  private toProblem(exception: unknown): Problem {
    if (exception instanceof ValidationFailedError) {
      return { code: exception.code, detail: exception.message, errors: exception.errors };
    }
    if (exception instanceof DomainError) {
      return { code: exception.code, detail: exception.message };
    }
    const code = knownCode(exception);
    if (code) {
      return { code, detail: DETAIL[code] };
    }
    this.logger.error(exception);
    return { code: 'internal_error', detail: DETAIL.internal_error };
  }
}

/**
 * O código de um erro do Nest ou do leitor do corpo do Express; `undefined` para os outros, que
 * são inesperados. O adaptador do Express embrulha o erro do leitor num `HttpException`, com o
 * original em `cause`.
 */
function knownCode(exception: unknown): ErrorCode | undefined {
  const parserCode = bodyParserCode(exception);
  if (parserCode) {
    return parserCode;
  }
  if (exception instanceof HttpException) {
    return bodyParserCode(exception.cause) ?? HTTP_STATUS_CODE[exception.getStatus()];
  }
  return undefined;
}

function bodyParserCode(error: unknown): ErrorCode | undefined {
  const type = (error as { type?: unknown } | null | undefined)?.type;
  return typeof type === 'string' ? BODY_PARSER_CODE[type] : undefined;
}
