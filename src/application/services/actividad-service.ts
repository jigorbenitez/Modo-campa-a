import type { Actividad, Oportunidad, Problema, Compromiso } from "@/domain/entities";
import type { EntityId } from "@/domain/shared/types";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface CreateActivityCommand {
  activity: Actividad;
  detectedProblems: Problema[];
  detectedOpportunities: Oportunidad[];
  commitments: Compromiso[];
}

export interface ActivityContext {
  activity: Actividad;
  problems: Problema[];
  opportunities: Oportunidad[];
  commitments: Compromiso[];
}

export interface ActividadService {
  create(context: ServiceContext, command: CreateActivityCommand): Promise<ServiceResult<ActivityContext>>;
  getContext(context: ServiceContext, activityId: EntityId): Promise<ServiceResult<ActivityContext>>;
}
