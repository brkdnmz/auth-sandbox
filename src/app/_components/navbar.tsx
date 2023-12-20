import Link from "next/link";
import { FaGithub, FaQuestion } from "react-icons/fa6";
import { VerifyEmailAlert } from "../(home)/_components/verify-email-alert";
import { NotImplemented } from "./not-implemented";

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
      <nav className="flex grow items-center justify-end gap-5">
        <VerifyEmailAlert />

        <Link
          title="GitHub Repo"
          href="https://github.com/brkdnmz/auth-sandbox"
          target="_blank"
          className="opacity-50 transition-opacity hover:opacity-100"
        >
          <FaGithub size={50} />
        </Link>

        <NotImplemented>
          <button disabled>
            <FaQuestion
              size={47}
              className="opacity-50 transition-opacity hover:opacity-100"
            />
          </button>
        </NotImplemented>
      </nav>
    </header>
  );
}
