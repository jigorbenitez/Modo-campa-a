export interface ValidationIssue {
  path: string[];
  message: string;
  code: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; issues: ValidationIssue[] };

/**
 * Puerto de validación compatible con futuras implementaciones como Zod.
 * El dominio no depende de una librería concreta.
 */
export interface Schema<T> {
  parse(input: unknown): T;
  safeParse(input: unknown): ValidationResult<T>;
}
