import Link from "next/link";
import { CardTitle } from "~/app/_components/ui/card";

export function SignInOrUpTitle({ signIn }: { signIn?: boolean }) {
  return (
    <CardTitle className="mb-4 flex flex-col items-center justify-center text-4xl font-bold">
      <span className="border-b border-slate-500 pb-3">
        Sign {signIn ? "In" : "Up"}
      </span>
      <Link
        href={`/auth/sign-${signIn ? "up" : "in"}`}
        className="pt-2 text-xl text-slate-500 transition-colors hover:text-slate-300"
      >
        Or {signIn ? "Up" : "In"}?
      </Link>
    </CardTitle>
  );
}
