import { ValidationError } from 'class-validator';
import { DomainError } from './domain.error.js';

export interface FieldError {
  field: string;
  message: string;
}

/** A entrada não passou na validação do DTO. */
export class ValidationFailedError extends DomainError {
  readonly code = 'validation_failed';

  constructor(readonly errors: FieldError[]) {
    super('A requisição tem campos inválidos.');
  }

  /** Achata os erros do `class-validator`, inclusive os aninhados, num item por campo. */
  static fromValidationErrors(errors: ValidationError[]): ValidationFailedError {
    return new ValidationFailedError(flatten(errors, ''));
  }
}

function flatten(errors: ValidationError[], prefix: string): FieldError[] {
  return errors.flatMap((error) => {
    const field = prefix ? `${prefix}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({ field, message }));
    return [...own, ...flatten(error.children ?? [], field)];
  });
}
