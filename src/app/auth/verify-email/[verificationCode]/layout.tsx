export const metadata = {
  title: "Verify Email",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid grow grid-cols-3 place-items-center">
      <section className="col-start-2">{children}</section>
    </main>
  );
}
