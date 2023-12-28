"use client";

import clsx from "clsx";
import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "~/hooks/use-session";

export function SignInOutButton() {
  const session = useSession();
  const router = useRouter();

  return (
    <button
      disabled={session.isLoading}
      onClick={() =>
        session.currentUser
          ? session.signOut.mutate()
          : router.push("/auth/sign-in")
      }
      className={clsx(
        session.isLoading && "opacity-30",
        !session.isLoading && "opacity-70 transition-opacity hover:opacity-100",
      )}
      title={session.currentUser ? "Sign Out" : "Sign In"}
    >
      {session.currentUser ? (
        <LogOut onClick={() => session.signOut.mutate()} size={30} />
      ) : (
        <LogIn size={30} />
      )}
    </button>
  );
}
