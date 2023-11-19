"use client";

import { useEffect, type PropsWithChildren } from "react";
import { initalizeAuthStore } from "~/store/auth-store";

// This is only responsible for initializing the auth store.
// Doesn't actually "provide" anything :D
export function AuthProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    void initalizeAuthStore();
  }, []);

  return children;
}
