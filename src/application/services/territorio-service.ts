import type { Barrio, Problema, Recorrida } from "@/domain/entities";
import type { EntityId } from "@/domain/shared/types";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface TerritoryOverview {
  barrios: Barrio[];
  openProblems: Problema[];
  upcomingTours: Recorrida[];
}

export interface TerritorioService {
  getOverview(context: ServiceContext): Promise<ServiceResult<TerritoryOverview>>;
  getBarrio(context: ServiceContext, barrioId: EntityId): Promise<ServiceResult<Barrio>>;
}
