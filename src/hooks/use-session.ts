import { api } from "~/trpc/react";

export function useSession() {
  const sessionUser = api.auth.getSession.useQuery(undefined, {
    retry: (failureCount, error) => {
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
