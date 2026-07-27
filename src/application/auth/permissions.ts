import type { UserRole } from "@/domain/entities";

export type Permission =
  | "municipality:manage"
  | "users:read"
  | "users:manage"
  | "activities:read"
  | "activities:write"
  | "territory:read"
  | "territory:write"
  | "institutions:read"
  | "institutions:write"
  | "documents:read"
  | "documents:write"
  | "proposals:read"
  | "proposals:write"
  | "commitments:read"
  | "commitments:write"
  | "audit:read";

const readPermissions: Permission[] = [
  "activities:read",
  "territory:read",
  "institutions:read",
  "documents:read",
  "proposals:read",
  "commitments:read",
];

export const rolePermissions: Record<UserRole, readonly Permission[]> = {
  administrator: [
    "municipality:manage",
    "users:read",
    "users:manage",
    ...readPermissions,
    "activities:write",
    "territory:write",
    "institutions:write",
    "documents:write",
    "proposals:write",
    "commitments:write",
    "audit:read",
  ],
  coordinator: [
    "users:read",
    ...readPermissions,
    "activities:write",
    "territory:write",
    "institutions:write",
    "documents:write",
    "proposals:write",
    "commitments:write",
    "audit:read",
  ],
  territorial_manager: [
    ...readPermissions,
    "activities:write",
    "territory:write",
    "commitments:write",
  ],
  institutional_manager: [
    ...readPermissions,
    "activities:write",
    "institutions:write",
    "documents:write",
    "commitments:write",
  ],
  volunteer: ["activities:read", "activities:write", "territory:read"],
  consultant: [...readPermissions, "proposals:write", "documents:write"],
  guest: ["activities:read", "territory:read"],
  read_only: readPermissions,
};

export class AuthorizationService {
  can(role: UserRole, permission: Permission): boolean {
    return rolePermissions[role].includes(permission);
  }

  assert(role: UserRole, permission: Permission): void {
    if (!this.can(role, permission)) {
      throw new Error(`El rol ${role} no posee el permiso ${permission}.`);
    }
  }
}
