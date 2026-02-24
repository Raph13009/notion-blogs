import Link from "next/link";
import { ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-4xl leading-none font-bold tracking-tight text-[#111827] md:text-5xl dark:text-zinc-100 [font-family:var(--font-darker-grotesque)]"
            prefetch
          >
            BoostAI Blog
            <span
              aria-hidden="true"
              className="ml-3 inline-block text-[#6D28D9] md:ml-4"
            >
              .
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="https://www.boostaiconsulting.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-[#475569] transition-colors hover:border-zinc-400 hover:text-[#111827] dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              Visit BoostAI Consulting
            </Link>
            <ModeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">{children}</main>

      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-8 text-sm text-zinc-600 sm:px-6 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} BoostAIConsulting. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
