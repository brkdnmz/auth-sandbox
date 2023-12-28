"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type PropsWithChildren } from "react";
import { useSession } from "~/hooks/use-session";
import { useToast } from "./ui/use-toast";

/*
  What a shitty situation in dev mode: https://github.com/vercel/next.js/issues/39492
  The issue is, in dev mode, this component unnecessarily unmounts and remounts,
  causing `session.refresh()` to execute twice!

  Okay, I thought this was a bug-causing issue. Well, it's not.
  The bug I thought this was causing was actually caused by an irrelevant code.
*/
export function ProtectedRoute({ children }: PropsWithChildren) {
  const [isSessionRefreshed, setIsSessionRefreshed] = useState(false);
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const isAllowed = Boolean(isSessionRefreshed && session.currentUser);

  useEffect(() => {
    if (isSessionRefreshed || session.isLoading) return;
    session.refresh();
    setIsSessionRefreshed(true);
  }, [isSessionRefreshed, session]);

  useEffect(() => {
    if (!isAllowed && isSessionRefreshed && !session.isLoading) {
      toast({
        title: "Not Allowed",
        description: "You must be signed in to visit this page",
        variant: "destructive",
        duration: 2000,
      });
      router.push("/auth/sign-in");
    }
  }, [isAllowed, isSessionRefreshed, router, session.isLoading, toast]);

  return isAllowed ? children : null;
}
