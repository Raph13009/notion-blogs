import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { calculateReadingTime } from "@/lib/utils";
import { PostSummary, normalizeTagToSlug } from "@/lib/notion";
import Reveal from "@/components/blog/reveal";
import { ArticleVisual } from "@/components/blog/article-visual";

interface PostCardProps {
  post: PostSummary & { estimatedWords?: number };
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const readingTime = calculateReadingTime(post.estimatedWords || 350);

  return (
    <Reveal delayMs={index * 80}>
      <article className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-[0_18px_38px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:shadow-[0_24px_45px_rgba(88,28,135,0.24)]">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(140deg,rgba(139,92,246,0.15),transparent_35%,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <Link href={`/blog/${post.slug}`} className="block" prefetch>
          <ArticleVisual
            slug={post.slug}
            title={post.title}
            imageUrl={post.coverImage}
            sizes="(max-width: 768px) 92vw, (max-width: 1200px) 44vw, 520px"
            className="mb-4 max-w-[520px] border-zinc-800 bg-zinc-950"
            imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <time dateTime={post.date}>{format(new Date(post.date), "MMM d, yyyy")}</time>
            <span>•</span>
            <span>{readingTime}</span>
            {post.category ? (
              <>
                <span>•</span>
                <span>{post.category}</span>
              </>
            ) : null}
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 transition-colors duration-300 group-hover:text-violet-200">
            {post.title}
          </h2>

          <p className="mt-3 text-base leading-8 text-zinc-300">{post.description}</p>
        </Link>

        {post.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${normalizeTagToSlug(tag)}`}
                prefetch
                className="inline-flex"
              >
                <Badge
                  variant="outline"
                  className="rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 transition-colors hover:border-violet-400/60 hover:text-violet-200"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}
