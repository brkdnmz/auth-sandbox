"use client";

import Link from "next/link";
import { SignOut } from "~/app/_components/sign-out";
import { Button } from "~/app/_components/ui/button";
import { type SessionUser } from "~/types";

type AuthButtonsProps = {
  currentUser?: SessionUser;
};

// Shows "Sign In" and "Sign Up" buttons if the user has not signed in,
// and "Sign Out" button otherwise.
export function AuthButtons({ currentUser }: AuthButtonsProps) {
  return (
    <div className="flex justify-center gap-10 pt-10 text-3xl">
      {!currentUser && (
        <>
          <Button className="h-min" asChild>
            <Link href="auth/signin">Sign In</Link>
          </Button>
          <Button variant="outline" className="h-min" asChild>
            <Link href="auth/signup">Sign Up</Link>
          </Button>
        </>
      )}
      {currentUser && <SignOut />}
    </div>
  );
}
