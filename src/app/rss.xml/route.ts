import { getPublishedPosts } from "@/lib/notion";
import { SITE_DESCRIPTION, SITE_NAME, canonicalUrl } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts();

  const items = posts
    .map((post) => {
      const description = post.description || "Read the full article.";

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${canonicalUrl(`/blog/${post.slug}`)}</link>
          <guid>${canonicalUrl(`/blog/${post.slug}`)}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <description>${escapeXml(description)}</description>
        </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(SITE_NAME)}</title>
        <link>${canonicalUrl("/blog")}</link>
        <description>${escapeXml(SITE_DESCRIPTION)}</description>
        <language>en-us</language>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
