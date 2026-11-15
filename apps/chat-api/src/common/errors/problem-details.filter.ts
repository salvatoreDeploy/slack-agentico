import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { DomainError } from './domain.error.js';
import { ErrorCode } from './error-code.js';
import { VALIDATION_FAILED_DETAIL, ValidationFailedError } from './validation-failed.error.js';

/** O mapa de código para status: mora só aqui (rule de erros da API). */
const ERROR_STATUS: Record<ErrorCode, number> = {
  validation_failed: 400,
  malformed_body: 400,
  payload_too_large: 413,
  not_found: 404,
  internal_error: 500,
};

/** Os `HttpException` que o Nest e o Express lançam por conta própria, pelo status. */
const HTTP_STATUS_CODE: Partial<Record<number, ErrorCode>> = {
  400: 'validation_failed',
  404: 'not_found',
  413: 'payload_too_large',
};

const DETAIL: Record<ErrorCode, string> = {
  validation_failed: VALIDATION_FAILED_DETAIL,
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
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title: STATUS_CODES[status],
        status,
        code: problem.code,
        detail: problem.detail,
        errors: problem.errors,
      });
  }

  private toProblem(exception: unknown): Problem {
    if (exception instanceof ValidationFailedError) {
      return { code: exception.code, detail: exception.message, errors: exception.errors };
    }
    if (exception instanceof DomainError) {
      return { code: exception.code, detail: exception.message };
    }
    const code = exception instanceof HttpException ? httpExceptionCode(exception) : undefined;
    if (code) {
      return { code, detail: DETAIL[code] };
    }
    this.logger.error(exception);
    return { code: 'internal_error', detail: DETAIL.internal_error };
  }
}

/**
 * O código de um `HttpException`; `undefined` quando o filter não o aceita e ele vira erro
 * inesperado. O adaptador do Express embrulha o JSON malformado num 400, com o `SyntaxError` do
 * leitor do corpo em `cause`.
 */
function httpExceptionCode(exception: HttpException): ErrorCode | undefined {
  if (exception.cause instanceof SyntaxError) {
    return 'malformed_body';
  }
  return HTTP_STATUS_CODE[exception.getStatus()];
}
