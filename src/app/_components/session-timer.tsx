"use client";

import { type HTMLProps } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useAccessToken } from "~/hooks/use-access-token";
import { useForceRender } from "~/hooks/use-force-render";
import { useSession } from "~/hooks/use-session";
import { decodeJwt } from "~/server/auth/jwt";
import { Timer } from "./ui/timer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// Displays the time left until session expiration in "mm:ss" format.
export function SessionTimer(props: HTMLProps<HTMLDivElement>) {
  const { currentUser } = useSession();
  const accessToken = useAccessToken();
  const expiresAt = decodeJwt(accessToken ?? "")?.exp;

  // Rerender every second to update the timer.
  useForceRender(1);

  if (!expiresAt || !currentUser) return <></>;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const secondsLeft = expiresAt - nowSeconds;

  return (
    <div className={props.className}>
      {secondsLeft > 0 ? (
        <>
          Session expires in <Timer seconds={secondsLeft} />
        </>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                Session expired
                <sup className="ml-1">
                  <FaQuestionCircle className="inline" />
                </sup>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              May be refreshed with the refresh token
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
