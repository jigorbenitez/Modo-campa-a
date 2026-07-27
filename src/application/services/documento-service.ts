import type { Documento } from "@/domain/entities";
import type { EntityId } from "@/domain/shared/types";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface DocumentoService {
  get(context: ServiceContext, documentId: EntityId): Promise<ServiceResult<Documento>>;
  findRelated(context: ServiceContext, documentId: EntityId): Promise<ServiceResult<Documento[]>>;
}
