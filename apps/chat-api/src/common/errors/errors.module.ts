import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ProblemDetailsFilter } from './problem-details.filter.js';
import { ValidationFailedError } from './validation-failed.error.js';

/**
 * O filter e a validação globais, registrados como providers do app, e não no `main.ts`, para
 * valerem também nos testes (`AGENTS.md` da API, "Aplicação HTTP").
 */
@Module({
  providers: [
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          exceptionFactory: (errors) => ValidationFailedError.fromValidationErrors(errors),
        }),
    },
  ],
})
export class ErrorsModule {}
