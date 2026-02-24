import { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/notion";
import { canonicalUrl } from "@/lib/site";
import { KnowledgeLayout } from "@/components/blog/knowledge-layout";
import { ArticleVisual } from "@/components/blog/article-visual";
import { estimateReadingTimeLabel, getTopic, sortByBusinessPriority, TOPIC_CONFIG } from "@/lib/blog-taxonomy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Base de connaissances MVP SaaS pour fondateurs early-stage.",
  alternates: {
    canonical: canonicalUrl("/blog"),
  },
};

export default async function BlogIndexPage() {
  const posts = sortByBusinessPriority(await getPublishedPosts());

  if (posts.length === 0) {
    return (
      <KnowledgeLayout active="all">
        <section className="max-w-[1200px]">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
            Tous les articles
          </h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
            Ressources structurées pour cadrer, construire et scaler votre MVP SaaS.
          </p>
        </section>
      </KnowledgeLayout>
    );
  }

  return (
    <KnowledgeLayout active="all">
      <section className="max-w-[1200px]">
        <h1 className="text-[32px] font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
          Tous les articles
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#6B7280] dark:text-zinc-400">
          Ressources structurées pour cadrer, construire et scaler votre MVP SaaS.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
          {posts.map((post) => {
            const category = post.category || TOPIC_CONFIG[getTopic(post)].title;
            const author = post.author || "BoostAI Editorial";

            return (
              <article
                key={post.id}
                className="group transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                <Link href={`/blog/${post.slug}`} className="block" prefetch>
                  <ArticleVisual
                    slug={post.slug}
                    title={post.title}
                    imageUrl={post.coverImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 520px"
                  />

                  <div className="mt-4 flex min-h-[170px] flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12px] uppercase tracking-[0.08em] text-[#6B7280] dark:text-zinc-400">
                        {category}
                      </p>
                      {post.isFeatured ? (
                        <span className="rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 text-[21px] font-semibold leading-tight text-[#111827] transition-colors duration-200 group-hover:text-[#1F2937] dark:text-zinc-100 dark:group-hover:text-zinc-50">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-6 text-[#6B7280] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden dark:text-zinc-400">
                      {post.description}
                    </p>
                    <p className="mt-4 text-[12px] text-[#6B7280] dark:text-zinc-400">
                      {author} · {estimateReadingTimeLabel(post)} lecture
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </KnowledgeLayout>
  );
}
