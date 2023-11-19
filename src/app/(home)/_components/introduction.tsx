"use client";

import Link from "next/link";
import { type SessionUser } from "~/types";
import Hi from "./hi";

type IntroductionProps = {
  currentUser?: SessionUser;
};

// The introduction component -- where I introduce the app.
export default function Introduction({ currentUser }: IntroductionProps) {
  return (
    <>
      <Hi currentUser={currentUser} />

      <h3 className="text-2xl">
        I have built this app just to practice{" "}
        <Link
          href="https://jwt.io/"
          target="_blank"
          title="Learn about JWT"
          className="whitespace-nowrap font-bold hover:text-violet-700"
        >
          JWT-based
        </Link>{" "}
        authentication w/ email verification, and demonstrate how things are
        done.
      </h3>
    </>
  );
}
