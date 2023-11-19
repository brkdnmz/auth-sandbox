// A small helper component to show the provided seconds in "mm:ss" format.
export function Timer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);

  return (
    <span className="rounded-lg px-2 py-1 font-mono dark:bg-slate-700">
      {minutes.toString().padStart(2, "0")} :{" "}
      {(seconds % 60).toString().padStart(2, "0")}
    </span>
  );
}
