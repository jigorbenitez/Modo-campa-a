import type { Evento } from "@/domain/entities";
import type { ISODateTime } from "@/domain/shared/types";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface AgendaService {
  getRange(context: ServiceContext, from: ISODateTime, to: ISODateTime): Promise<ServiceResult<Evento[]>>;
}
