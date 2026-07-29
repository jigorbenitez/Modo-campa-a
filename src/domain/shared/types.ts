/** Identificador opaco. El proveedor de persistencia define su formato. */
export type EntityId = string;

export type ISODate = string;
export type ISODateTime = string;

export interface AuditMetadata {
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  createdBy?: EntityId;
  updatedBy?: EntityId;
  version: number;
}

export interface TenantScoped {
  /** Límite de aislamiento obligatorio para toda información municipal. */
  municipioId: EntityId;
  /** Asociación territorial opcional con uno o más circuitos electorales. */
  circuitIds?: EntityId[];
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  number?: string;
  locality: string;
  province: string;
  country: string;
  postalCode?: string;
  coordinates?: GeoPoint;
}

export interface MediaAsset {
  id: EntityId;
  type: "image" | "video" | "audio" | "file";
  url: string;
  title: string;
  description?: string;
  capturedAt?: ISODateTime;
  tags: string[];
}

export interface Money {
  amount: number;
  currency: "ARS" | "USD" | string;
}

export interface StateChange<TState extends string> {
  from?: TState;
  to: TState;
  changedAt: ISODateTime;
  changedBy?: EntityId;
  reason?: string;
}

export interface Metric {
  id: EntityId;
  name: string;
  description: string;
  value?: number;
  unit?: string;
  source?: string;
  measuredAt?: ISODateTime;
  target?: number;
}

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EntityQuery extends Partial<PageRequest> {
  search?: string;
  tags?: string[];
  active?: boolean;
}
