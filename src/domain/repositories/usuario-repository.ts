import type { Usuario, UserRole, UserStatus } from "@/domain/entities";
import type { EntityQuery } from "@/domain/shared/types";
import type { Repository } from "./repository";

export interface UsuarioQuery extends EntityQuery {
  role?: UserRole;
  status?: UserStatus;
}

export type UsuarioRepository = Repository<Usuario, UsuarioQuery>;
