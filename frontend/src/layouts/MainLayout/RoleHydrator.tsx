"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores";

/** Restores the role chosen earlier (localStorage) once the app is running in the browser. */
export function RoleHydrator() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
