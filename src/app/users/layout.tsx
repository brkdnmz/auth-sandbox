import type { PropsWithChildren } from "react";
import { ProtectedRoute } from "../_components/protected-route";

export default function Layout({ children }: PropsWithChildren) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
