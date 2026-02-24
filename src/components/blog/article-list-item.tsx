import Link from "next/link";
import { PostSummary } from "@/lib/notion";
import { estimateReadingTimeLabel } from "@/lib/blog-taxonomy";

interface ArticleListItemProps {
  post: PostSummary;
}

export function ArticleListItem({ post }: ArticleListItemProps) {
  return (
    <article className="border-b border-zinc-200 py-4 last:border-b-0 dark:border-zinc-800">
      <Link href={`/blog/${post.slug}`} className="block" prefetch>
        <h3 className="text-base font-semibold tracking-tight text-[#111827] hover:text-[#6D28D9] dark:text-zinc-100 dark:hover:text-violet-300">
          {post.title}
        </h3>
        <p className="mt-1 text-sm leading-7 text-[#6B7280] dark:text-zinc-400">{post.description}</p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          {estimateReadingTimeLabel(post)} lecture
        </p>
      </Link>
    </article>
  );
}
