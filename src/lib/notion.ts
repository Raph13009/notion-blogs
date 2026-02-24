import "server-only";

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

const LOCAL_POSTS: Post[] = [
  {
    id: "local-1",
    title: "Lancer un MVP en 30 jours",
    slug: "lancer-un-mvp-en-30-jours",
    description: "Plan simple pour sortir une premiere version sans se perdre.",
    date: "2026-01-12",
    author: "BoostAI Editorial",
    tags: ["MVP", "Execution"],
    category: "MVP",
    isFeatured: true,
    lastEditedTime: "2026-01-12T10:00:00.000Z",
    content: `## Objectif
Sortir une version utilisable en 30 jours.

## Etapes
1. Definir une promesse unique.
2. Construire un flux principal.
3. Tester avec 5 utilisateurs.

## Resultat attendu
Une base simple qui fonctionne et permet d'apprendre vite.`,
    wordCount: 52,
  },
  {
    id: "local-2",
    title: "Combien coute un MVP SaaS",
    slug: "combien-coute-un-mvp-saas",
    description: "Une estimation pragmatique pour eviter les mauvaises surprises.",
    date: "2026-01-05",
    author: "BoostAI Editorial",
    tags: ["Budget", "SaaS"],
    category: "Budget",
    isFeatured: false,
    lastEditedTime: "2026-01-05T10:00:00.000Z",
    content: `## Budget de base
Compter le design, le developpement et le deploiement.

## Fourchette
Le budget depend surtout du niveau de personnalisation et des integrations.`,
    wordCount: 33,
  },
  {
    id: "local-3",
    title: "Choisir une stack technique simple",
    slug: "choisir-une-stack-technique-simple",
    description: "Comment choisir une stack rapide a maintenir pour le debut.",
    date: "2025-12-22",
    author: "BoostAI Editorial",
    tags: ["Stack", "Architecture"],
    category: "Technique",
    isFeatured: false,
    lastEditedTime: "2025-12-22T10:00:00.000Z",
    content: `## Priorite
Choisir des outils connus par l'equipe.

## Regle
Favoriser la simplicite avant l'optimisation prematuree.`,
    wordCount: 25,
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function sortedPosts(): Post[] {
  return [...LOCAL_POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getWordCount(content: string): number {
  const cleanText = content.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanText) return 0;
  return cleanText.split(" ").length;
}

export async function getPublishedPosts(): Promise<PostSummary[]> {
  return sortedPosts().map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    date: post.date,
    author: post.author,
    tags: post.tags,
    category: post.category,
    coverImage: post.coverImage,
    isFeatured: post.isFeatured,
    lastEditedTime: post.lastEditedTime,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = sortedPosts().find((item) => item.slug === slug);
  if (!post) return null;
  return { ...post, wordCount: getWordCount(post.content) };
}

export async function getTagIndex(): Promise<string[]> {
  const tags = new Set<string>();
  for (const post of sortedPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function normalizeTagToSlug(tag: string): string {
  return slugify(tag);
}

export async function getPostsByTag(tagSlug: string): Promise<{ tag: string; posts: PostSummary[] }> {
  const posts = await getPublishedPosts();
  const matchedPosts = posts.filter((post) =>
    post.tags.some((tag) => normalizeTagToSlug(tag) === tagSlug)
  );
  const canonicalTag =
    matchedPosts[0]?.tags.find((tag) => normalizeTagToSlug(tag) === tagSlug) ?? tagSlug;
  return { tag: canonicalTag, posts: matchedPosts };
}

export async function getRelatedPosts(
  postId: string,
  tags: string[],
  limit = 3
): Promise<PostSummary[]> {
  const posts = await getPublishedPosts();
  const currentTags = new Set(tags.map(normalizeTagToSlug));

  return posts
    .filter((post) => post.id !== postId)
    .map((post) => ({
      post,
      overlap: post.tags.filter((tag) => currentTags.has(normalizeTagToSlug(tag))).length,
    }))
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((item) => item.post);
}
