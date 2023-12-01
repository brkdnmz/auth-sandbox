"use client";

import Link from "next/link";
import { SignOut } from "~/app/_components/sign-out";
import { Button } from "~/app/_components/ui/button";
import { useSession } from "~/hooks/use-session";

// Shows "Sign In" and "Sign Up" buttons if the user has not signed in,
// and "Sign Out" button otherwise.
export function AuthButtons() {
  const { currentUser } = useSession();

  return (
    <div className="flex justify-center gap-10 pt-10 text-3xl">
      {!currentUser && (
        <>
          <Button className="h-min" asChild>
            <Link href="auth/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" className="h-min" asChild>
            <Link href="auth/sign-up">Sign Up</Link>
          </Button>
        </>
      )}
      {currentUser && <SignOut />}
    </div>
  );
}
