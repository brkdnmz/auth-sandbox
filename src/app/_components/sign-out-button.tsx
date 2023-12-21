"use client";

import { useRevalidateSession } from "~/hooks/use-revalidate-session";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

// A button that triggers the signout process.
export function SignOutButton() {
  const revalidateSession = useRevalidateSession();
  const signOutMutation = api.auth.signOut.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signed out",
        variant: "default",
        duration: 2000,
      });
    },
    onSettled: (_, error) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        toast({
          title: "Error",
          description: "Session already expired",
          variant: "destructive",
          duration: 2000,
        });
      }
      void revalidateSession();
    },
  });

  const signOut = () => {
    signOutMutation.mutate();
  };

  return (
    <Button className="h-min" variant="outline" onClick={signOut}>
      Sign Out
    </Button>
  );
}