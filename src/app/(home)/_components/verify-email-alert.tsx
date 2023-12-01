"use client";

import { Mail } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/app/_components/ui/popover";
import { useSession } from "~/hooks/use-session";

export function VerifyEmailAlert() {
  const { currentUser } = useSession();

  if (!currentUser || currentUser.isVerified) return null;

  const email = currentUser.email;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" className="dark:bg-amber-300">
          <Mail />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 text-xs">
        Verify your email address {email}
      </PopoverContent>
    </Popover>
  );
}
