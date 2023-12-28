import { useIsMutating } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useToast } from "~/app/_components/ui/use-toast";
import { useAuthStore } from "~/store/auth-store";
import { api } from "~/trpc/react";

export function useSession() {
  const signIn = useSignIn();
  const signOut = useSignOut();
  const refreshSession = useRefreshSession();

  // https://github.com/TanStack/query/issues/2304
  // Multiple useMutations don't share the same state...
  const isRefreshing = useIsMutating({
    // This considers all loading mutations instead of only loading refreshSession mutations.
    // Well, not the most perfect solution, but couldn't figure out any other :(
    predicate: (mutation) => mutation.state.status === "loading",
  });

  const session = api.auth.getSession.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        if (!isRefreshing) refreshSession.mutate();
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
      isLoading: session.isLoading || isRefreshing, // This overwrite saved my life, oh man...
      currentUser: isSessionValid ? session.data : undefined,
      signIn,
      signOut,
      refresh: () => {
        if (!isRefreshing) refreshSession.mutate();
      }, // Inspired by this: https://next-auth.js.org/getting-started/client#updating-the-session
    }),
    [isRefreshing, isSessionValid, refreshSession, session, signIn, signOut],
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
  const revalidateSession = useCallback(() => {
    void trpcUtils.auth.getSession.invalidate();
  }, [trpcUtils.auth.getSession]);

  return revalidateSession;
}
