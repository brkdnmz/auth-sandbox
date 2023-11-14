import Link from "next/link";
import { Button } from "./_components/ui/button";

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
          <div className="flex justify-center gap-2 pt-10 text-3xl">
            <div title="Not implemented yet">
              <Button className="h-min" disabled>
                Sign in
              </Button>
            </div>
            <Button variant="outline" className="h-min" asChild>
              <Link href={"signup"}>Sign up</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
