export type ServiceErrorCode = "validation" | "not_found" | "conflict" | "forbidden" | "unexpected";

export type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: ServiceErrorCode; message: string; details?: Record<string, unknown> } };

export interface ServiceContext {
  municipioId: string;
  actorId?: string;
  correlationId?: string;
}
