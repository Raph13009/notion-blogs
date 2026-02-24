import Link from "next/link";
import { TopicKey, TOPIC_CONFIG } from "@/lib/blog-taxonomy";

type NavKey = "all" | TopicKey | "estimateur";

interface KnowledgeLayoutProps {
  active: NavKey;
  children: React.ReactNode;
}

const navItems: Array<{ key: NavKey; label: string; href: string; isNew?: boolean }> = [
  { key: "all", label: "Tous les articles", href: "/blog" },
  {
    key: "cout-budget-mvp",
    label: TOPIC_CONFIG["cout-budget-mvp"].title,
    href: "/blog/topic/cout-budget-mvp",
  },
  {
    key: "architecture-scalabilite",
    label: TOPIC_CONFIG["architecture-scalabilite"].title,
    href: "/blog/topic/architecture-scalabilite",
  },
  {
    key: "stack-outils",
    label: TOPIC_CONFIG["stack-outils"].title,
    href: "/blog/topic/stack-outils",
  },
  {
    key: "estimateur",
    label: "Estimateur MVP",
    href: "/blog/estimateur-mvp",
    isNew: true,
  },
];

export function KnowledgeLayout({ active, children }: KnowledgeLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-10 md:block">
      <aside className="md:fixed md:top-20 md:left-6 md:h-[calc(100vh-5rem)] md:w-[250px] md:border-r md:border-zinc-200 md:px-5 md:py-6 dark:md:border-zinc-800">
        <div className="md:flex md:h-full md:-translate-y-6 md:flex-col md:justify-center">
          <h1 className="mb-4 text-xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
            BoostAI Resources
          </h1>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = active === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-zinc-100 text-[#111827] dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-[#6B7280] hover:bg-zinc-50 hover:text-[#111827] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  }`}
                  prefetch
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.isNew ? (
                      <span className="rounded border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300">
                        New
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="md:ml-[320px]">{children}</main>
    </div>
  );
}
