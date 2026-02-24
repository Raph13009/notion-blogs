import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/notion";
import {
  TOPIC_CONFIG,
  TopicKey,
  getTopic,
  sortByBusinessPriority,
} from "@/lib/blog-taxonomy";
import { canonicalUrl } from "@/lib/site";
import { KnowledgeLayout } from "@/components/blog/knowledge-layout";
import { ArticleListItem } from "@/components/blog/article-list-item";

interface TopicPageProps {
  params: Promise<{ topic: string }>;
}

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(TOPIC_CONFIG).map((topic) => ({ topic }));
}

function isTopicKey(value: string): value is TopicKey {
  return value in TOPIC_CONFIG;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topic } = await params;

  if (!isTopicKey(topic)) {
    return {
      title: "Section introuvable",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: TOPIC_CONFIG[topic].title,
    description: TOPIC_CONFIG[topic].description,
    alternates: {
      canonical: canonicalUrl(`/blog/topic/${topic}`),
    },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params;

  if (!isTopicKey(topic)) {
    notFound();
  }

  const posts = sortByBusinessPriority(
    (await getPublishedPosts()).filter((post) => getTopic(post) === topic)
  );

  return (
    <KnowledgeLayout active={topic}>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
          {TOPIC_CONFIG[topic].title}
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
          {TOPIC_CONFIG[topic].description}
        </p>

        <div className="mt-6">
          {posts.map((post) => (
            <ArticleListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </KnowledgeLayout>
  );
}
