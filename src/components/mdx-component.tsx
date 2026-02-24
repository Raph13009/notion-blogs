import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { Badge } from "./ui/badge";
import { slugifyText } from "@/lib/utils";
import { StyledQuote } from "@/components/blog/styled-quote";

const toPlainText = (children?: React.ReactNode): string => {
  if (!children) return "";
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((child) => toPlainText(child)).join(" ");
  }
  if (typeof children === "object" && "props" in children) {
    return toPlainText((children as { props?: { children?: React.ReactNode } }).props?.children);
  }
  return "";
};

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => {
    const id = slugifyText(toPlainText(children));
    return (
      <h2 id={id} className="mt-14 mb-5 text-3xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
        {children}
      </h2>
    );
  },
  h2: ({ children }: { children?: React.ReactNode }) => {
    const id = slugifyText(toPlainText(children));
    return (
      <h2 id={id} className="mt-14 mb-5 text-3xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const id = slugifyText(toPlainText(children));
    return (
      <h3 id={id} className="mt-10 mb-4 text-2xl font-medium tracking-tight text-[#1F2937] dark:text-zinc-200">
        {children}
      </h3>
    );
  },
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-6 text-lg leading-[1.9] text-[#475569] dark:text-zinc-300">{children}</p>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className="link-underline text-violet-700 dark:text-violet-300" prefetch>
          {children}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className="link-underline text-violet-700 dark:text-violet-300"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  },
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-8 list-disc space-y-3 pl-6 text-lg leading-[1.9] text-[#475569] dark:text-zinc-300">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-8 list-decimal space-y-3 pl-6 text-lg leading-[1.9] text-[#475569] dark:text-zinc-300">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <StyledQuote>{children}</StyledQuote>
  ),
  hr: () => (
    <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
  ),
  code: ({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => {
    const isBlock = !!className?.includes("language-");

    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-5 font-mono text-sm leading-7 text-[#1F2937] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {children}
        </code>
      );
    }

    return (
      <Badge variant="pre" className="font-mono rounded-md text-sm">
        {children}
      </Badge>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-8 overflow-x-auto">{children}</pre>
  ),
  img: ({ src, alt }: { src?: string | Blob; alt?: string }) => {
    const imageUrl = src
      ? typeof src === "string"
        ? src
        : URL.createObjectURL(src)
      : "";

    return (
      <Image
        src={imageUrl}
        alt={alt || "Blog image"}
        className="my-8 h-auto w-full max-w-[640px] rounded-lg border border-zinc-200 dark:border-zinc-800"
        width={1200}
        height={675}
        sizes="(max-width: 768px) 92vw, 640px"
        loading="lazy"
      />
    );
  },
};

export { components };
