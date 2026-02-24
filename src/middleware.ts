import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isStaticAsset(pathname: string): boolean {
  return pathname.includes(".");
}

function isReservedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/blog") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/rss.xml"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isReservedPath(pathname) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const postsMatch = pathname.match(/^\/posts\/([^/]+)\/?$/);
  if (postsMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/blog/${postsMatch[1]}`;
    return NextResponse.redirect(url, 301);
  }

  const slugMatch = pathname.match(/^\/([^/]+)\/?$/);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (slug === "topic" || slug === "estimateur-mvp") {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/blog/${slug}`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
