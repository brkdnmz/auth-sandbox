"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSession } from "~/hooks/use-session";
import { AuthButtons } from "./_components/auth-buttons";
import Introduction from "./_components/introduction";

// The home page component.
export default function Home() {
  const { isLoading } = useSession();

  return (
    <main className="grid grow grid-cols-3 items-center">
      <section className="relative col-start-2 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="sync">
          {isLoading ? (
            <motion.div
              exit={{ opacity: 0 }}
              className="spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              key="loading"
            >
              <Loader2 className="animate-spin text-slate-600" size={70} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="loaded"
            >
              <Introduction />
              <AuthButtons />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
