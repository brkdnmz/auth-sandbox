import Link from "next/link";

const footerLinks: { href: string; description: string }[] = [
  { href: "https://create.t3.gg/", description: "Create T3 App" },
  { href: "https://ui.shadcn.com", description: "shadcn/ui" },
  {
    href: "https://fonts.google.com/specimen/JetBrains+Mono",
    description: "JetBrains Mono",
  },
];

export function Footer() {
  return (
    <footer className="py-3">
      <ul className="flex justify-center divide-x divide-slate-500">
        {footerLinks.map(({ href, description }) => (
          <li key={href}>
            <Link
              href={href}
              target="_blank"
              className="px-5 text-slate-400 opacity-50 transition-opacity hover:opacity-100"
            >
              {description}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  );
}
