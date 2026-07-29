"use client";

import { createContext, useContext } from "react";
import type { TerritorialEntity } from "../domain";

const TerritorialRegistryContext = createContext<TerritorialEntity[] | null>(null);

export function TerritorialRegistryProvider({
  entities,
  children,
}: {
  entities: TerritorialEntity[];
  children: React.ReactNode;
}) {
  return (
    <TerritorialRegistryContext.Provider value={entities}>
      {children}
    </TerritorialRegistryContext.Provider>
  );
}

export function useTerritorialEntities() {
  const entities = useContext(TerritorialRegistryContext);
  if (!entities) throw new Error("TerritorialRegistryProvider no está disponible.");
  return entities;
}
