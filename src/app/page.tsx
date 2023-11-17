import Link from "next/link";
import { NotImplemented } from "./_components/not-implemented";
import { Button } from "./_components/ui/button";

export default function Home() {
  return (
    <main className="grid grow grid-cols-3 items-center">
      <section className="col-start-2 text-center">
        <h1 className="mb-10 text-7xl font-extrabold">Hi!</h1>
        <h3 className="text-2xl">
          I have built this app just to practice{" "}
          <Link
            href="https://jwt.io/"
            target="_blank"
            title="Learn about JWT"
            className="font-medium hover:text-violet-700"
          >
            JWT
          </Link>
          -based authentication w/ email verification, and demonstrate how
          things are done.
        </h3>
        <div className="flex justify-center gap-10 pt-10 text-3xl">
          <NotImplemented>
            <Button className="h-min" disabled>
              Sign in
            </Button>
          </NotImplemented>
          <Button variant="outline" className="h-min" asChild>
            <Link href="auth/signup">Sign up</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
