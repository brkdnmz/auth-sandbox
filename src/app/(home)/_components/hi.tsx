"use client";

import { type SessionUser } from "~/types";

type HiProps = {
  currentUser?: SessionUser;
};

// If the user has signed in, it displays "Hi, <username>!"
// Otherwise, it's a mere "Hi!"
export default function Hi({ currentUser }: HiProps) {
  return (
    <h1 className="mb-10 text-7xl font-extrabold">
      {currentUser ? (
        <>
          Hi, <span className="text-fuchsia-600">{currentUser.username}</span>!
        </>
      ) : (
        <>Hi!</>
      )}
    </h1>
  );
}
