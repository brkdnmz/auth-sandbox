"use client";

import { Loader2, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "~/hooks/use-session";
import { Button } from "./ui/button";

export function SignInOutButton() {
  const session = useSession();
  const router = useRouter();

  return session.isLoading ? (
    <Loader2 className="animate-spin" />
  ) : (
    <Button
      variant="ghost"
      asChild
      size="icon"
      onClick={() =>
        session.currentUser
          ? session.signOut.mutate()
          : router.push("/auth/sign-in")
      }
    >
      {session.currentUser ? (
        <LogOut onClick={() => session.signOut.mutate()} />
      ) : (
        <LogIn />
      )}
    </Button>
  );
}
