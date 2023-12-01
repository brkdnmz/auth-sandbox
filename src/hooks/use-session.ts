import { useAuthStore } from "~/store/auth-store";
import { api } from "~/trpc/react";

export function useSession() {
  const utils = api.useUtils();

  const {
    actions: { handleTokens },
  } = useAuthStore();

  const refreshSession = api.auth.refreshSession.useMutation({
    onSuccess: (data) => {
      handleTokens(data.accessToken, data.refreshToken);
      void utils.auth.getSession.invalidate();
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
