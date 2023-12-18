"use client";

import { useCallback } from "react";
import { api } from "~/trpc/react";

export function useRevalidateSession() {
  const trpcUtils = api.useUtils();

  const revalidateSession = useCallback(
    () => trpcUtils.auth.getSession.invalidate(),
    [trpcUtils.auth.getSession],
  );

  return revalidateSession;
}
