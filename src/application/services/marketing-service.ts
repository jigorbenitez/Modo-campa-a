import type { PublicationChannel } from "@/domain/entities";
import type { ServiceContext, ServiceResult } from "@/application/shared/service-result";

export interface ChannelSummary {
  channel: PublicationChannel;
  planned: number;
  published: number;
}

export interface MarketingService {
  getChannelSummary(context: ServiceContext): Promise<ServiceResult<ChannelSummary[]>>;
}
