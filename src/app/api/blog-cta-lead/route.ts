import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

interface BlogCtaLeadPayload {
  email: string;
  blogSlug?: string;
  blogTitle?: string;
}

function validatePayload(payload: unknown): payload is BlogCtaLeadPayload {
  if (!payload || typeof payload !== "object") return false;
  const body = payload as Record<string, unknown>;
  if (typeof body.email !== "string") return false;
  if (body.blogSlug !== undefined && typeof body.blogSlug !== "string") return false;
  if (body.blogTitle !== undefined && typeof body.blogTitle !== "string") return false;
  return true;
}

function setPropertyIfPossible(
  output: Record<string, unknown>,
  dbProperties: DatabaseObjectResponse["properties"],
  key: string,
  value: string | number | null
) {
  const property = dbProperties[key];
  if (!property || value === null) return;

  if (property.type === "rich_text") {
    output[key] = {
      rich_text: [{ type: "text", text: { content: String(value).slice(0, 2000) } }],
    };
    return;
  }

  if (property.type === "title") {
    output[key] = {
      title: [{ type: "text", text: { content: String(value).slice(0, 2000) } }],
    };
    return;
  }

  if (property.type === "email" && typeof value === "string") {
    output[key] = { email: value };
    return;
  }

  if (property.type === "number" && typeof value === "number") {
    output[key] = { number: value };
    return;
  }

  if (property.type === "date" && typeof value === "string") {
    output[key] = { date: { start: value } };
    return;
  }

  if (property.type === "select" && typeof value === "string") {
    output[key] = { select: { name: value.slice(0, 100) } };
  }
}

function formatBlogContext(blogSlug?: string | null, blogTitle?: string | null) {
  return [blogTitle ? `Titre: ${blogTitle}` : null, blogSlug ? `Slug: ${blogSlug}` : null]
    .filter(Boolean)
    .join(" | ");
}

async function sendLeadEmail(email: string, blogSlug?: string | null, blogTitle?: string | null) {
  const recipient = process.env.FORMSUBMIT_TO_EMAIL || "raphaellevy027@gmail.com";
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;
  const context = formatBlogContext(blogSlug, blogTitle);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Nouveau lead CTA Blog - Discutons de votre projet",
      _captcha: "false",
      _template: "table",
      source: "CTA Bas d'article Blog",
      article: context || "Non renseigné",
      email,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FormSubmit failed with status ${response.status}`);
  }
}

async function sendLeadToNotion(email: string, blogSlug?: string | null, blogTitle?: string | null) {
  const notionToken = process.env.NOTION_TOKEN;
  const leadsDatabaseId = process.env.NOTION_LEADS_DATABASE_ID;

  if (!notionToken || !leadsDatabaseId) {
    return { ok: false, reason: "missing_notion_env" as const };
  }

  const notion = new Client({ auth: notionToken });
  const database = (await notion.databases.retrieve({
    database_id: leadsDatabaseId,
  })) as DatabaseObjectResponse;

  const properties: Record<string, unknown> = {};
  const dbProperties = database.properties;
  const titleKey = Object.entries(dbProperties).find(([, prop]) => prop.type === "title")?.[0];

  if (titleKey) {
    setPropertyIfPossible(properties, dbProperties, titleKey, `CTA Lead ${email}`);
  }

  setPropertyIfPossible(properties, dbProperties, "Email", email);
  setPropertyIfPossible(properties, dbProperties, "Source", "CTA Bas d'article Blog");
  setPropertyIfPossible(properties, dbProperties, "Submitted At", new Date().toISOString());
  const answersSummary = [
    "Lead Type: Blog CTA",
    blogTitle ? `Blog Title: ${blogTitle}` : null,
    blogSlug ? `Blog Slug: ${blogSlug}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  setPropertyIfPossible(properties, dbProperties, "Answers", answersSummary);

  await notion.pages.create({
    parent: { database_id: leadsDatabaseId },
    properties: properties as PageObjectResponse["properties"],
  });

  return { ok: true as const };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    if (!validatePayload(json)) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const email = json.email.trim().toLowerCase();
    const blogSlug = json.blogSlug?.trim() || null;
    const blogTitle = json.blogTitle?.trim() || null;
    if (!/.+@.+\..+/.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    await Promise.all([sendLeadEmail(email, blogSlug, blogTitle), sendLeadToNotion(email, blogSlug, blogTitle)]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Blog CTA lead submission failed:", error);
    return NextResponse.json({ ok: false, error: "submission_failed" }, { status: 500 });
  }
}
