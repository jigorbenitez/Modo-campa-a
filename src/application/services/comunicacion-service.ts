import type { Publicacion } from "@/domain/entities";
import type { EntityId } from "@/domain/shared/types";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface ComunicacionService {
  getEditorialCalendar(context: ServiceContext): Promise<ServiceResult<Publicacion[]>>;
  getProposalPublications(context: ServiceContext, proposalId: EntityId): Promise<ServiceResult<Publicacion[]>>;
}
