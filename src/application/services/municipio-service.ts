import type { Municipio } from "@/domain/entities";
import type { EntityId } from "@/domain/shared/types";
import type { ServiceResult } from "@/application/shared/service-result";

export interface MunicipioService {
  getById(id: EntityId): Promise<ServiceResult<Municipio>>;
  updateSettings(id: EntityId, settings: Municipio["settings"]): Promise<ServiceResult<Municipio>>;
}
