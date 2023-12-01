"use client";

import { useSession } from "~/hooks/use-session";

// If the user has signed in, it displays "Hi, <username>!"
// Otherwise, it's a mere "Hi!"
export default function Hi() {
  const { currentUser } = useSession();

  return (
    <h1 className="mb-10 text-center text-7xl font-extrabold">
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
