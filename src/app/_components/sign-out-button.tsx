"use client";

import { useSession } from "~/hooks/use-session";
import { Button } from "./ui/button";

// A button that triggers the signout process.
export function SignOutButton() {
  const { signOut } = useSession();

  return (
    <Button
      className="h-min"
      variant="outline"
      onClick={() => signOut.mutate()}
    >
      Sign Out
    </Button>
  );
}
