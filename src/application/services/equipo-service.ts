import type { Equipo, TeamMember } from "@/domain/entities";
import type { EntityId } from "@/domain/shared/types";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface EquipoService {
  getTeam(context: ServiceContext): Promise<ServiceResult<Equipo>>;
  getMember(context: ServiceContext, memberId: EntityId): Promise<ServiceResult<TeamMember>>;
}
