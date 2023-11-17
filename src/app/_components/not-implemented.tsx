import { type PropsWithChildren } from "react";

export function NotImplemented({ children }: PropsWithChildren) {
  return (
    <div className="cursor-not-allowed" title="Not implemented yet">
      <div className="pointer-events-none">{children}</div>
    </div>
  );
}
