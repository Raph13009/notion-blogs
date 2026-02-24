import { permanentRedirect } from "next/navigation";

export default async function LegacySlugRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/blog/${slug}`);
}
