import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'node:http';
import { DomainError } from './domain.error.js';
import { ErrorCode } from './error-code.js';
import { VALIDATION_FAILED_DETAIL, ValidationFailedError } from './validation-failed.error.js';

/**
 * O mapa de código para status: mora só aqui (rule de erros da API). O `request_rejected` é o
 * único que, vindo de um `HttpException`, mantém o status dele; o valor aqui vale para o erro de
 * domínio que o usar.
 */
const ERROR_STATUS: Record<ErrorCode, number> = {
  validation_failed: 400,
  malformed_body: 400,
  payload_too_large: 413,
  not_found: 404,
  unauthenticated: 401,
  invalid_credentials: 401,
  too_many_attempts: 429,
  wrong_current_password: 422,
  password_unchanged: 422,
  email_taken: 409,
  username_taken: 409,
  client_message_id_conflict: 409,
  request_rejected: 400,
  internal_error: 500,
};

/** Os códigos que o filter dá sozinho, sem erro de domínio: o erro de domínio traz o próprio texto. */
type GenericCode = Extract<
  ErrorCode,
  | 'validation_failed'
  | 'malformed_body'
  | 'payload_too_large'
  | 'not_found'
  | 'unauthenticated'
  | 'request_rejected'
  | 'internal_error'
>;

/** Os `HttpException` com código próprio, pelo status. Os outros 4xx são `request_rejected`. */
const HTTP_STATUS_CODE: Partial<Record<number, GenericCode>> = {
  400: 'validation_failed',
  401: 'unauthenticated',
  404: 'not_found',
  413: 'payload_too_large',
};

const DETAIL: Record<GenericCode, string> = {
  validation_failed: VALIDATION_FAILED_DETAIL,
  malformed_body: 'O corpo da requisição não é um JSON válido.',
  payload_too_large: 'O corpo da requisição é grande demais.',
  not_found: 'O recurso pedido não existe.',
  unauthenticated: 'É preciso entrar para continuar.',
  request_rejected: 'A requisição foi recusada.',
  internal_error: 'Erro inesperado no servidor.',
};

interface Problem {
  status: number;
  code: ErrorCode;
  detail: string;
  errors?: ValidationFailedError['errors'];
  headers?: Record<string, string>;
}

/**
 * Traduz todo erro em `application/problem+json` (LLD, "Erros"). É o único lugar que monta
 * resposta de erro.
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (response.headersSent) {
      // A resposta já começou a sair: não há como trocar o status, só registrar.
      this.logUnexpected(exception);
      return;
    }
    const problem = this.toProblem(exception);
    if (problem.headers) {
      response.set(problem.headers);
    }
    response
      .status(problem.status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title: STATUS_CODES[problem.status],
        status: problem.status,
        code: problem.code,
        detail: problem.detail,
        errors: problem.errors,
      });
  }

  private toProblem(exception: unknown): Problem {
    if (exception instanceof DomainError) {
      const errors = exception instanceof ValidationFailedError ? exception.errors : undefined;
      return {
        status: ERROR_STATUS[exception.code],
        code: exception.code,
        detail: exception.message,
        errors,
        headers: exception.headers,
      };
    }
    if (exception instanceof HttpException && exception.getStatus() < 500) {
      const code = httpExceptionCode(exception);
      return { status: exception.getStatus(), code, detail: DETAIL[code] };
    }
    this.logUnexpected(exception);
    return { status: 500, code: 'internal_error', detail: DETAIL.internal_error };
  }

  /**
   * Registra só o nome, a mensagem e a stack. O objeto inteiro pode levar dados gravados, como os
   * parâmetros de um `QueryFailedError`, que nunca vão para o log (LLD, "Logs").
   */
  private logUnexpected(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(`${exception.name}: ${exception.message}`, exception.stack);
      return;
    }
    this.logger.error('Erro inesperado sem a forma de Error.');
  }
}

/**
 * O código de um `HttpException` 4xx. O adaptador do Express embrulha o JSON malformado num 400,
 * com o `SyntaxError` do leitor do corpo em `cause`.
 */
function httpExceptionCode(exception: HttpException): GenericCode {
  if (exception.cause instanceof SyntaxError) {
    return 'malformed_body';
  }
  return HTTP_STATUS_CODE[exception.getStatus()] ?? 'request_rejected';
}
