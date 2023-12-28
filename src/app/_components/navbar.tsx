import Link from "next/link";
import { FaGithub, FaQuestion, FaUsers } from "react-icons/fa6";
import { VerifyEmailAlert } from "../(home)/_components/verify-email-alert";
import { NotImplemented } from "./not-implemented";
import { SessionTimer } from "./session-timer";
import { SignInOutButton } from "./sign-in-out-button";

export function Navbar() {
  return (
    <header className="mx-4 mt-4 flex items-center">
      <Link
        href="/"
        title="Return to home page"
        className="flex items-center self-stretch opacity-50 transition-opacity hover:opacity-100"
      >
        <h1 className="text-2xl font-extrabold text-slate-300">Auth Sandbox</h1>
      </Link>
      <nav className="flex grow items-center justify-end gap-10">
        <VerifyEmailAlert />

        <SessionTimer className="text-center text-2xl text-slate-400" />

        <SignInOutButton />

        <Link
          href="/users"
          title="See all users"
          className="opacity-50 transition-opacity hover:opacity-100"
        >
          <FaUsers size={30} />
        </Link>

        <Link
          href="https://github.com/brkdnmz/auth-sandbox"
          title="GitHub Repo"
          target="_blank"
          className="opacity-50 transition-opacity hover:opacity-100"
        >
          <FaGithub size={30} />
        </Link>

        <NotImplemented>
          <button disabled>
            <FaQuestion
              size={33}
              className="opacity-50 transition-opacity hover:opacity-100"
            />
          </button>
        </NotImplemented>
      </nav>
    </header>
  );
}
