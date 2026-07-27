import type { Propuesta } from "@/domain/entities";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface CampaignSummary {
  activeProposals: Propuesta[];
  openCommitments: number;
  scheduledEvents: number;
}

export interface CampanaService {
  getSummary(context: ServiceContext): Promise<ServiceResult<CampaignSummary>>;
}
