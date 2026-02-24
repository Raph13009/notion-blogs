export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://blog.boostaiconsulting.com";

export const SITE_NAME = "BoostAIConsulting Blog";
export const SITE_DESCRIPTION =
  "Practical product, engineering, and growth playbooks for tech founders.";

export function canonicalUrl(pathname = "/"): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath}`;
}
