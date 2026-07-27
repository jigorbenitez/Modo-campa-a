import type { ReactNode } from "react";
import type { UserRole } from "@/domain/entities";
import type { Permission } from "@/application/auth";
import { AuthorizationService } from "@/application/auth";

export function PermissionGate({
  role,
  permission,
  children,
  fallback = null,
}: {
  role: UserRole;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return new AuthorizationService().can(role, permission) ? children : fallback;
}
