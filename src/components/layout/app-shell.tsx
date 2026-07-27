import type { ReactNode } from "react";
import { AppFrame } from "./app-frame";

export function AppShell({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
