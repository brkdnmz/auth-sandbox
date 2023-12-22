"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../_components/ui/table";

type User = RouterOutputs["user"]["getAll"][number];

export default function Users() {
  const users = api.user.getAll.useQuery();

  const isLoading = users.isLoading;

  const columns: {
    label: string;
    key: keyof User;
  }[] = [
    { label: "ID", key: "id" },
    { label: "Email", key: "email" },
    { label: "Username", key: "username" },
    { label: "Full Name", key: "fullName" },
    { label: "Signed Up", key: "createdAt" },
    { label: "Verified", key: "pendingEmailVerification" },
  ];

  const displayData = (user: User, key: (typeof columns)[number]["key"]) => {
    switch (key) {
      case "createdAt":
        return user[key].toLocaleString();
      case "pendingEmailVerification":
        return !user[key] ? "Yes" : "No";
      default:
        return user[key]?.toString() ?? "—";
    }
  };

  return (
    <main className="grid grow grid-cols-5">
      <section className="relative col-span-3 col-start-2">
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
              className="mt-24 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-600"
            >
              <Table className="p-2">
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.label}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data?.map((user) => (
                    <TableRow key={user.id}>
                      {columns.map((col) => (
                        <TableCell key={col.key} className="whitespace-nowrap">
                          {displayData(user, col.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
