import { MetadataRoute } from "next";
import { getPublishedPosts, getTagIndex, normalizeTagToSlug } from "@/lib/notion";
import { canonicalUrl } from "@/lib/site";
import { TOPIC_CONFIG } from "@/lib/blog-taxonomy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getTagIndex()]);

  const postUrls = posts.map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.lastEditedTime || post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const tagUrls = tags.map((tag) => ({
    url: canonicalUrl(`/blog/tag/${normalizeTagToSlug(tag)}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const topicUrls = Object.keys(TOPIC_CONFIG).map((topic) => ({
    url: canonicalUrl(`/blog/topic/${topic}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: canonicalUrl("/blog"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: canonicalUrl("/blog/estimateur-mvp"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...topicUrls,
    ...postUrls,
    ...tagUrls,
  ];
}
