import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="grid grid-cols-3">
        <div className="col-start-2 text-center">
          <h1 className="text-7xl font-extrabold">Hi!</h1>
          <h3 className="text-2xl">
            I have built this app just to practice{" "}
            <Link
              href="https://jwt.io/"
              target="_blank"
              className="font-medium"
            >
              JWT
            </Link>
            -based authentication w/ email verification, and demonstrate how it
            is done.
          </h3>
        </div>
      </section>
    </main>
  );
}
