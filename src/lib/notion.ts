import "server-only";

import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const REVALIDATE_SECONDS = 60 * 60;

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

type NotionProps = PageObjectResponse["properties"];

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  author?: string;
  tags: string[];
  category?: string;
  coverImage?: string;
  isFeatured: boolean;
  lastEditedTime: string;
}

export interface Post extends PostSummary {
  content: string;
  wordCount: number;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getTitle(props: NotionProps): string {
  const title = props.Title;
  if (title?.type === "title" && title.title.length > 0) {
    return title.title.map((item) => item.plain_text).join("");
  }

  return "Untitled";
}

function getRichText(items: RichTextItemResponse[] | undefined): string {
  if (!items || items.length === 0) return "";
  return items.map((item) => item.plain_text).join("").trim();
}

function getDescription(props: NotionProps): string {
  const description = props.Description;

  if (description?.type === "rich_text") {
    return getRichText(description.rich_text).slice(0, 160);
  }

  return "";
}

function getDate(props: NotionProps): string {
  const publishedDate = props["Published Date"];
  if (publishedDate?.type === "date" && publishedDate.date?.start) {
    return publishedDate.date.start;
  }

  return new Date(0).toISOString();
}

function getAuthor(props: NotionProps): string | undefined {
  const author = props.Author;

  if (author?.type === "people" && author.people.length > 0) {
    const firstAuthor = author.people[0];
    if ("name" in firstAuthor && firstAuthor.name) {
      return firstAuthor.name;
    }
  }

  if (author?.type === "rich_text") {
    const text = getRichText(author.rich_text);
    return text || undefined;
  }

  return undefined;
}

function getTags(props: NotionProps): string[] {
  const tags = props.Tags;
  if (tags?.type === "multi_select") {
    return tags.multi_select.map((tag) => tag.name).filter(Boolean);
  }

  return [];
}

function getCategory(props: NotionProps): string | undefined {
  const category = props.Category;
  if (category?.type === "select") {
    return category.select?.name;
  }

  return undefined;
}

function getFeaturedImage(page: PageObjectResponse): string | undefined {
  const featuredImage = page.properties["Featured Image"];

  if (featuredImage?.type === "url" && featuredImage.url) {
    return featuredImage.url;
  }

  if (featuredImage?.type === "files" && featuredImage.files.length > 0) {
    const firstFile = featuredImage.files[0];
    if (firstFile.type === "external") return firstFile.external.url;
    if (firstFile.type === "file") return firstFile.file.url;
  }

  if (page.cover) {
    return page.cover.type === "external"
      ? page.cover.external.url
      : page.cover.file.url;
  }

  return undefined;
}

function getFeaturedFlag(props: NotionProps): boolean {
  const featured = props.Featured;

  if (!featured) return false;

  if (featured.type === "checkbox") {
    return featured.checkbox;
  }

  if (featured.type === "select") {
    const value = featured.select?.name?.toLowerCase() || "";
    return ["featured", "yes", "true", "oui"].includes(value);
  }

  if (featured.type === "status") {
    const value = featured.status?.name?.toLowerCase() || "";
    return ["featured", "yes", "true", "oui"].includes(value);
  }

  if (featured.type === "rich_text") {
    const value = getRichText(featured.rich_text).toLowerCase();
    return ["featured", "yes", "true", "oui", "1"].includes(value);
  }

  return false;
}

function getStableSlug(page: PageObjectResponse): string {
  const props = page.properties;
  const slugProp = props.Slug;

  if (slugProp?.type === "rich_text") {
    const value = slugify(getRichText(slugProp.rich_text));
    if (value) return value;
  }

  return slugify(getTitle(props)) || `post-${page.id.slice(0, 8).toLowerCase()}`;
}

function mapPageToSummary(page: PageObjectResponse): PostSummary {
  const props = page.properties;
  const title = getTitle(props);

  return {
    id: page.id,
    title,
    slug: getStableSlug(page),
    description: getDescription(props),
    date: getDate(props),
    author: getAuthor(props),
    tags: getTags(props),
    category: getCategory(props),
    coverImage: getFeaturedImage(page),
    isFeatured: getFeaturedFlag(props),
    lastEditedTime: page.last_edited_time,
  };
}

async function fetchPublishedPages(): Promise<PageObjectResponse[]> {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return [];
  }

  const database = (await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  })) as DatabaseObjectResponse;

  const statusProperty = database.properties.Status;
  const statusFilter =
    statusProperty?.type === "status"
      ? {
          property: "Status",
          status: {
            equals: "Published",
          },
        }
      : {
          property: "Status",
          select: {
            equals: "Published",
          },
        };

  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const query: QueryDatabaseParameters = {
      database_id: process.env.NOTION_DATABASE_ID,
      filter: statusFilter,
      sorts: [
        {
          property: "Published Date",
          direction: "descending",
        },
      ],
      start_cursor: cursor,
      page_size: 100,
    };

    const response = await notion.databases.query(query);

    pages.push(
      ...(response.results.filter(
        (result): result is PageObjectResponse => result.object === "page"
      ) as PageObjectResponse[])
    );

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return pages;
}

async function fetchPostContent(pageId: string): Promise<string> {
  const markdownBlocks = await n2m.pageToMarkdown(pageId);
  const markdown = n2m.toMarkdownString(markdownBlocks);
  const content = typeof markdown === "string" ? markdown : markdown.parent || "";
  return content.trim();
}

const getCachedPublishedSummaries = unstable_cache(
  async () => {
    const pages = await fetchPublishedPages();
    const summaries = pages.map(mapPageToSummary);

    const usedSlugs = new Set<string>();
    return summaries.map((summary) => {
      let slug = summary.slug;
      while (usedSlugs.has(slug)) {
        slug = `${summary.slug}-${summary.id.slice(0, 6).toLowerCase()}`;
      }
      usedSlugs.add(slug);
      return { ...summary, slug };
    });
  },
  ["notion-published-posts"],
  { revalidate: REVALIDATE_SECONDS, tags: ["posts"] }
);

const getCachedPostContent = unstable_cache(
  async (pageId: string) => fetchPostContent(pageId),
  ["notion-post-content"],
  { revalidate: REVALIDATE_SECONDS, tags: ["posts"] }
);

export function getWordCount(content: string): number {
  const cleanText = content
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) return 0;
  return cleanText.split(" ").length;
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  return getCachedPublishedSummaries();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPublishedPosts();
  const summary = posts.find((post) => post.slug === slug);

  if (!summary) return null;

  const content = await getCachedPostContent(summary.id);

  return {
    ...summary,
    content,
    wordCount: getWordCount(content),
    description: summary.description || content.slice(0, 160),
  };
}

export async function getTagIndex(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tags = new Set<string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      if (tag) tags.add(tag);
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function normalizeTagToSlug(tag: string): string {
  return slugify(tag);
}

export async function getPostsByTag(tagSlug: string): Promise<{
  tag: string;
  posts: PostSummary[];
}> {
  const posts = await getPublishedPosts();

  const matchedPosts = posts.filter((post) =>
    post.tags.some((tag) => normalizeTagToSlug(tag) === tagSlug)
  );

  const canonicalTag =
    matchedPosts[0]?.tags.find((tag) => normalizeTagToSlug(tag) === tagSlug) ||
    tagSlug;

  return { tag: canonicalTag, posts: matchedPosts };
}

export async function getRelatedPosts(
  postId: string,
  tags: string[],
  limit = 3
): Promise<PostSummary[]> {
  if (tags.length === 0) return [];

  const posts = await getPublishedPosts();
  const currentTagSet = new Set(tags.map((tag) => normalizeTagToSlug(tag)));

  return posts
    .filter((post) => post.id !== postId)
    .map((post) => {
      const overlap = post.tags.filter((tag) =>
        currentTagSet.has(normalizeTagToSlug(tag))
      ).length;
      return { post, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.post);
}
