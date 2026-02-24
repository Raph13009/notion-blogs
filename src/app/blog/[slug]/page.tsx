import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { components } from "@/components/mdx-component";
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
  normalizeTagToSlug,
} from "@/lib/notion";
import { calculateReadingTime, slugifyText } from "@/lib/utils";
import { SITE_NAME, SITE_URL, canonicalUrl } from "@/lib/site";
import { AuthorCard } from "@/components/blog/author-card";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { CalloutBox } from "@/components/blog/callout-box";
import { TableOfContents, TocItem } from "@/components/blog/table-of-contents";
import { ArticleVisual } from "@/components/blog/article-visual";
import Reveal from "@/components/blog/reveal";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const url = canonicalUrl(`/blog/${post.slug}`);

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: new Date(post.lastEditedTime).toISOString(),
      authors: post.author ? [post.author] : [],
      tags: post.tags,
      images: [
        {
          url: post.coverImage || `${SITE_URL}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.coverImage || `${SITE_URL}/opengraph-image.png`],
    },
  };
}

function extractTocItems(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const items: TocItem[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const text = line.replace(/^##\s+/, "").trim();
      if (text) items.push({ id: slugifyText(text), text, level: 2 });
    }
    if (line.startsWith("### ")) {
      const text = line.replace(/^###\s+/, "").trim();
      if (text) items.push({ id: slugifyText(text), text, level: 3 });
    }
  }

  return items;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, post.tags, 3);
  const tocItems = extractTocItems(post.content);
  const postUrl = canonicalUrl(`/blog/${post.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": postUrl,
        },
        headline: post.title,
        description: post.description,
        image: post.coverImage || `${SITE_URL}/opengraph-image.png`,
        datePublished: new Date(post.date).toISOString(),
        dateModified: new Date(post.lastEditedTime).toISOString(),
        author: {
          "@type": "Person",
          name: post.author || "BoostAIConsulting",
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/opengraph-image.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Blog",
            item: canonicalUrl("/blog"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="mx-auto w-full max-w-[720px]">
          <nav className="mb-4 text-sm text-[#6B7280] dark:text-zinc-400" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/blog" className="link-underline" prefetch>
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="truncate text-[#475569] dark:text-zinc-300">{post.title}</li>
            </ol>
          </nav>

          <Reveal>
            <header className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white px-6 py-8 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6">
                <ArticleVisual
                  slug={post.slug}
                  title={post.title}
                  imageUrl={post.coverImage}
                  priority
                  sizes="(max-width: 768px) 92vw, 720px"
                />
              </div>

              <div>
                {post.category ? (
                  <Badge className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-300">
                    {post.category}
                  </Badge>
                ) : null}

                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl dark:text-zinc-100">
                  {post.title}
                </h1>

                <div className="mt-4 h-[2px] w-24 rounded-full bg-violet-500/60 dark:bg-violet-400/60" />

                <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-[#6B7280] dark:text-zinc-400">
                  <time dateTime={post.date}>{format(new Date(post.date), "MMMM d, yyyy")}</time>
                  <span>•</span>
                  <span>{calculateReadingTime(post.wordCount)}</span>
                  <span>•</span>
                  <span>{post.wordCount} words</span>
                  {post.author ? (
                    <>
                      <span>•</span>
                      <span>{post.author}</span>
                    </>
                  ) : null}
                </div>

                {post.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link href={`/blog/tag/${normalizeTagToSlug(tag)}`} key={tag} prefetch>
                        <Badge
                          variant="outline"
                          className="rounded-full border-zinc-300 bg-white text-[#475569] transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-violet-400/60 dark:hover:text-violet-200"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </header>
          </Reveal>

          <CalloutBox title="Founder takeaway">
            Move from opinion to evidence quickly. Publish lightweight experiments,
            measure outcomes, and let customer behavior decide what to scale.
          </CalloutBox>

          <div className="mt-10">
            <ReactMarkdown
              components={components}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <AuthorCard author={post.author} />
          <NewsletterCta blogSlug={post.slug} blogTitle={post.title} />

          {relatedPosts.length > 0 ? (
            <section className="mt-14 border-t border-[#E5E7EB] pt-10 dark:border-zinc-800">
              <h2 className="text-2xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
                Related posts
              </h2>
              <ul className="mt-5 space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <li key={relatedPost.id}>
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="link-underline text-base text-[#334155] dark:text-zinc-300"
                      prefetch
                    >
                      {relatedPost.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        <TableOfContents items={tocItems} />
      </div>
    </>
  );
}
