import Link from "next/link";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <aside className="sticky top-24 hidden h-fit rounded-lg border border-zinc-200 bg-white p-5 lg:block dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280] dark:text-zinc-400">
        On this page
      </p>
      <nav className="mt-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={`link-underline block text-sm leading-6 text-[#334155] dark:text-zinc-300 ${
              item.level === 3 ? "pl-4 text-[#6B7280] dark:text-zinc-400" : ""
            }`}
          >
            {item.text}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
