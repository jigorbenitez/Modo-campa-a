import type { Documento, DocumentStatus, DocumentType } from "@/domain/entities";
import type { EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface DocumentoQuery extends EntityQuery { type?: DocumentType; status?: DocumentStatus }
export type DocumentoRepository = Repository<Documento, DocumentoQuery>;
