import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/post-card";
import {
  getPostsByTag,
  getTagIndex,
  normalizeTagToSlug,
} from "@/lib/notion";
import { canonicalUrl } from "@/lib/site";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = await getTagIndex();
  return tags.map((tag) => ({ tag: normalizeTagToSlug(tag) }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const { tag, posts } = await getPostsByTag(tagSlug);

  if (posts.length === 0) {
    return {
      title: "Tag Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${tag} Articles`,
    description: `Browse ${posts.length} published article${posts.length > 1 ? "s" : ""} tagged ${tag}.`,
    alternates: {
      canonical: canonicalUrl(`/blog/tag/${tagSlug}`),
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: tagSlug } = await params;
  const { tag, posts } = await getPostsByTag(tagSlug);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <section>
      <header className="mb-8 border-b border-border/70 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{tag}</h1>
        <p className="mt-2 text-muted-foreground">
          {posts.length} article{posts.length > 1 ? "s" : ""}
        </p>
      </header>

      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
