import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

interface EstimatorLeadPayload {
  firstName: string;
  email: string;
  consent: boolean;
  estimateMin: number;
  estimateMax: number;
  totalScore: number;
  answers: {
    ambition?: string | null;
    timeline?: string | null;
    featureCount?: string | null;
    integrationLevel?: string | null;
    advancedFeature?: string | null;
    designLevel?: string | null;
    platform?: string | null;
    adminLevel?: string | null;
  };
}

function validatePayload(payload: unknown): payload is EstimatorLeadPayload {
  if (!payload || typeof payload !== "object") return false;

  const body = payload as Record<string, unknown>;
  return (
    typeof body.firstName === "string" &&
    typeof body.email === "string" &&
    typeof body.consent === "boolean" &&
    typeof body.estimateMin === "number" &&
    typeof body.estimateMax === "number" &&
    typeof body.totalScore === "number" &&
    typeof body.answers === "object"
  );
}

function decodeAnswer(value: string | null | undefined): string {
  if (!value) return "N/A";

  const map: Record<string, string> = {
    validation: "Validation rapide",
    base: "Produit vendable",
    scalable: "Base scalable",
    lt1: "< 1 mois",
    m1_2: "1-2 mois",
    gt3: "3 mois +",
    f1_2: "1-2 fonctionnalités",
    f3_5: "3-5 fonctionnalités",
    f6_plus: "6+ fonctionnalités",
    none_simple: "Intégrations simples",
    medium: "Intégrations moyennes",
    complex: "Intégrations complexes",
    none: "Aucune",
    realtime: "Temps réel",
    ai: "IA",
    template: "Template",
    custom_light: "Sur mesure léger",
    premium: "Premium",
    web: "Web",
    web_mobile: "Web + Mobile responsive",
    native: "Natif iOS/Android",
    simple: "Simple",
    advanced: "Avancé",
  };

  return map[value] || value;
}

function buildFormSubmitPayload(payload: EstimatorLeadPayload) {
  return {
    _subject: `Nouveau lead Estimateur MVP - ${payload.firstName}`,
    _captcha: "false",
    _template: "table",
    firstName: payload.firstName,
    email: payload.email,
    estimateRange: `${payload.estimateMin}€ - ${payload.estimateMax}€`,
    score: String(payload.totalScore),
    ambition: decodeAnswer(payload.answers.ambition),
    timeline: decodeAnswer(payload.answers.timeline),
    featureCount: decodeAnswer(payload.answers.featureCount),
    integrationLevel: decodeAnswer(payload.answers.integrationLevel),
    advancedFeature: decodeAnswer(payload.answers.advancedFeature),
    designLevel: decodeAnswer(payload.answers.designLevel),
    platform: decodeAnswer(payload.answers.platform),
    adminLevel: decodeAnswer(payload.answers.adminLevel),
  };
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

async function sendLeadToNotion(payload: EstimatorLeadPayload) {
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
    setPropertyIfPossible(properties, dbProperties, titleKey, `Lead ${payload.firstName}`);
  }

  setPropertyIfPossible(properties, dbProperties, "Name", payload.firstName);
  setPropertyIfPossible(properties, dbProperties, "Email", payload.email);
  setPropertyIfPossible(
    properties,
    dbProperties,
    "Estimate Range",
    `${payload.estimateMin}€ - ${payload.estimateMax}€`
  );
  setPropertyIfPossible(properties, dbProperties, "Estimate Min", payload.estimateMin);
  setPropertyIfPossible(properties, dbProperties, "Estimate Max", payload.estimateMax);
  setPropertyIfPossible(properties, dbProperties, "Score", payload.totalScore);
  setPropertyIfPossible(properties, dbProperties, "Source", "Mini Calculateur MVP");
  setPropertyIfPossible(properties, dbProperties, "Submitted At", new Date().toISOString());

  const answersSummary = [
    `Ambition: ${decodeAnswer(payload.answers.ambition)}`,
    `Timeline: ${decodeAnswer(payload.answers.timeline)}`,
    `Features: ${decodeAnswer(payload.answers.featureCount)}`,
    `Integrations: ${decodeAnswer(payload.answers.integrationLevel)}`,
    `Advanced: ${decodeAnswer(payload.answers.advancedFeature)}`,
    `Design: ${decodeAnswer(payload.answers.designLevel)}`,
    `Platform: ${decodeAnswer(payload.answers.platform)}`,
    `Admin: ${decodeAnswer(payload.answers.adminLevel)}`,
  ].join(" | ");

  setPropertyIfPossible(properties, dbProperties, "Answers", answersSummary);

  await notion.pages.create({
    parent: { database_id: leadsDatabaseId },
    properties: properties as PageObjectResponse["properties"],
  });

  return { ok: true as const };
}

async function sendLeadEmail(payload: EstimatorLeadPayload) {
  const recipient = process.env.FORMSUBMIT_TO_EMAIL || "raphaellevy027@gmail.com";
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildFormSubmitPayload(payload)),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FormSubmit failed with status ${response.status}`);
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    if (!validatePayload(json)) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    if (!json.consent) {
      return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
    }

    if (!/.+@.+\..+/.test(json.email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    await Promise.all([sendLeadEmail(json), sendLeadToNotion(json)]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Estimator lead submission failed:", error);
    return NextResponse.json({ ok: false, error: "submission_failed" }, { status: 500 });
  }
}
