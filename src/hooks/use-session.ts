import { useAuthStore } from "~/store/auth-store";
import { api } from "~/trpc/react";
import { useRevalidateSession } from "./use-revalidate-session";

export function useSession() {
  const {
    actions: { handleTokens },
  } = useAuthStore();
  const revalidateSession = useRevalidateSession();
  const refreshSession = api.auth.refreshSession.useMutation({
    onSuccess: (data) => {
      handleTokens(data.accessToken, data.refreshToken);
      void revalidateSession();
    },
  });
  const sessionUser = api.auth.getSession.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        refreshSession.mutate();
      }
      if (error.data?.code === "UNAUTHORIZED") return false;
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
  });

  return {
    ...sessionUser,
    currentUser: !sessionUser.isError ? sessionUser.data : undefined,
  };
}
