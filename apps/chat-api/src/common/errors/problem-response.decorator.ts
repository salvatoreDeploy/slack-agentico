import { applyDecorators } from '@nestjs/common';
import { ApiResponse, type ApiResponseOptions } from '@nestjs/swagger';
import { ErrorCode } from './error-code.js';

/**
 * Documenta no contrato uma resposta de erro `problem+json` de uma rota, com os códigos que ela
 * pode devolver naquele status como enum (LLD, "Erros"), e os cabeçalhos da resposta, se houver.
 */
export function ApiProblemResponse(status: number, codes: ErrorCode[], headers?: ApiResponseOptions['headers']) {
  return applyDecorators(
    ApiResponse({
      status,
      headers,
      content: {
        'application/problem+json': {
          schema: {
            type: 'object',
            required: ['type', 'title', 'status', 'code', 'detail'],
            properties: {
              type: { type: 'string', example: 'about:blank' },
              title: { type: 'string' },
              status: { type: 'integer', example: status },
              code: { type: 'string', enum: codes },
              detail: { type: 'string' },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { field: { type: 'string' }, message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    }),
  );
}
