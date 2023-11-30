import { useAuthStore } from "~/store/auth-store";
import { api } from "~/trpc/react";

export function useSession() {
  const utils = api.useUtils();

  const {
    actions: { handleTokens },
  } = useAuthStore();

  const refreshSession = api.auth.refreshSession.useMutation({
    // onError: (error) => {
    //   toast({
    //     title: "Error",
    //     description: `Failed to refresh the session: ${error.message}`,
    //     variant: "destructive",
    //     duration: 2000,
    //   });
    // },
    onSuccess: (data) => {
      // toast({
      //   title: "Session refreshed",
      //   description: `Refreshed the auth tokens using the refresh token`,
      //   variant: "default",
      //   duration: 5000,
      // });
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
  });

  return {
    ...sessionUser,
    currentUser: !sessionUser.isError ? sessionUser.data : undefined,
  };
}
