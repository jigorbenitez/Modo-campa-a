import type { Compromiso, CommitmentPriority, CommitmentStatus } from "@/domain/entities";
import type { EntityId, EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface CompromisoQuery extends EntityQuery {
  status?: CommitmentStatus;
  priority?: CommitmentPriority;
  assignedMemberId?: EntityId;
  overdue?: boolean;
}
export type CompromisoRepository = Repository<Compromiso, CompromisoQuery>;
