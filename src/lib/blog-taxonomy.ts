import { PostSummary } from "@/lib/notion";

export type TopicKey = "cout-budget-mvp" | "architecture-scalabilite" | "stack-outils";

export const TOPIC_CONFIG: Record<
  TopicKey,
  {
    title: string;
    description: string;
  }
> = {
  "cout-budget-mvp": {
    title: "Coût & Budget MVP",
    description: "Priorités budgétaires, arbitrages ROI et décisions de scope.",
  },
  "architecture-scalabilite": {
    title: "Architecture & Scalabilité",
    description: "Fondations techniques pour lancer vite sans dette bloquante.",
  },
  "stack-outils": {
    title: "Stack & Outils",
    description: "Technologies et outils pragmatiques pour exécuter efficacement.",
  },
};

function textBlob(post: PostSummary): string {
  return `${post.title} ${post.description} ${post.category || ""} ${(post.tags || []).join(" ")}`.toLowerCase();
}

export function getTopic(post: PostSummary): TopicKey {
  const text = textBlob(post);

  if (/cout|coût|budget|prix|tarif|estimation|devis|runway/.test(text)) {
    return "cout-budget-mvp";
  }

  if (/architecture|scalabil|infra|backend|api|database|tenant/.test(text)) {
    return "architecture-scalabilite";
  }

  return "stack-outils";
}

export function businessPriority(post: PostSummary): number {
  const text = textBlob(post);

  let score = 0;
  if (/cout|coût|budget|prix|tarif|estimation|devis/.test(text)) score += 120;
  if (/mvp/.test(text)) score += 80;
  if (/guide|checklist|template|framework/.test(text)) score += 40;
  if (/architecture|stack|outils/.test(text)) score += 20;
  return score;
}

export function sortByBusinessPriority(posts: PostSummary[]): PostSummary[] {
  return [...posts].sort((a, b) => businessPriority(b) - businessPriority(a));
}

export function estimateReadingTimeLabel(post: PostSummary): string {
  const estimatedWords = Math.max(
    280,
    post.description.split(/\s+/).filter(Boolean).length * 12 +
      post.title.split(/\s+/).filter(Boolean).length * 4
  );
  const minutes = Math.max(1, Math.ceil(estimatedWords / 225));
  return `${minutes} min`;
}
