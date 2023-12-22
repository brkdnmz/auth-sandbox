import { useCallback, useMemo } from "react";
import { useToast } from "~/app/_components/ui/use-toast";
import { useAuthStore } from "~/store/auth-store";
import { api } from "~/trpc/react";

export function useSession() {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const refreshSession = useRefreshSession();
  const session = api.auth.getSession.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        refreshSession.mutate();
        return false;
      }
      return failureCount < 3;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
  });

  const isSessionValid =
    session.isSuccess && (refreshSession.isIdle || refreshSession.isSuccess);

  return useMemo(
    () => ({
      ...session,
      isLoading: refreshSession.isLoading || session.isLoading, // This overwrite saved my life, oh man...
      currentUser: isSessionValid ? session.data : undefined,
      signIn,
      signOut,
      refresh: refreshSession.mutate, // Inspired by this: https://next-auth.js.org/getting-started/client#updating-the-session
    }),
    [
      isSessionValid,
      refreshSession.isLoading,
      refreshSession.mutate,
      session,
      signIn,
      signOut,
    ],
  );
}

function useSignIn() {
  const revalidateSession = useRevalidateSession();
  const signIn = api.auth.signIn.useMutation({
    onSuccess: () => {
      revalidateSession();
    },
  });

  return signIn;
}

function useSignOut() {
  const revalidateSession = useRevalidateSession();
  const { toast } = useToast();
  const signOut = api.auth.signOut.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signed out",
        variant: "default",
        duration: 2000,
      });
    },
    onSettled: () => {
      revalidateSession();
    },
  });

  return signOut;
}

function useRefreshSession() {
  const revalidateSession = useRevalidateSession();
  const {
    actions: { handleTokens },
  } = useAuthStore();
  const refreshSession = api.auth.refreshSession.useMutation({
    onSuccess: (data) => {
      handleTokens(data.accessToken, data.refreshToken);
      revalidateSession();
    },
  });

  return refreshSession;
}

function useRevalidateSession() {
  const trpcUtils = api.useUtils();

  // TODO: This runs because of `trpcUtils.client` so frequently, couldn't figure out why...
  // Doesn't cause unnecessary rerenders tho.

  const revalidateSession = useCallback(() => {
    void trpcUtils.auth.getSession.invalidate();
  }, [trpcUtils.auth.getSession]);

  return revalidateSession;
}
