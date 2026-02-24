"use client";

import { useMemo, useState } from "react";

type Ambition = "validation" | "base" | "scalable";
type Timeline = "lt1" | "m1_2" | "gt3";
type FeatureCount = "f1_2" | "f3_5" | "f6_plus";
type IntegrationLevel = "none_simple" | "medium" | "complex";
type AdvancedFeature = "none" | "realtime" | "ai";
type DesignLevel = "template" | "custom_light" | "premium";
type Platform = "web" | "web_mobile" | "native";
type AdminLevel = "none" | "simple" | "advanced";

interface Range {
  min: number;
  max: number;
}

interface CostBreakdown {
  development: Range;
  design: Range;
  integrations: Range;
  maintenance: Range;
  total: Range;
}

function formatEuros(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} €`;
}

function optionScore<T extends string>(value: T, map: Record<T, number>): number {
  return map[value];
}

const scoreMaps = {
  ambition: {
    validation: 0,
    base: 1,
    scalable: 2,
  } as Record<Ambition, number>,
  timeline: {
    lt1: 0,
    m1_2: 1,
    gt3: 2,
  } as Record<Timeline, number>,
  featureCount: {
    f1_2: 1.5,
    f3_5: 3,
    f6_plus: 4.5,
  } as Record<FeatureCount, number>,
  integration: {
    none_simple: 0.5,
    medium: 1,
    complex: 2,
  } as Record<IntegrationLevel, number>,
  advanced: {
    none: 0,
    realtime: 1,
    ai: 2,
  } as Record<AdvancedFeature, number>,
  design: {
    template: 0,
    custom_light: 1.5,
    premium: 3,
  } as Record<DesignLevel, number>,
  platform: {
    web: 0,
    web_mobile: 1,
    native: 2,
  } as Record<Platform, number>,
  admin: {
    none: 0,
    simple: 1,
    advanced: 2,
  } as Record<AdminLevel, number>,
};

function rangeAdd(a: Range, b: Range): Range {
  return { min: a.min + b.min, max: a.max + b.max };
}

function applyFactor(range: Range, factor: number): Range {
  return { min: Math.round(range.min * factor), max: Math.round(range.max * factor) };
}

function clampRange(range: Range, maxValue: number): Range {
  return { min: Math.min(range.min, maxValue), max: Math.min(range.max, maxValue) };
}

function getDevelopmentRange(
  featureCount: FeatureCount | null,
  platform: Platform | null,
  adminLevel: AdminLevel | null,
  timeline: Timeline | null,
  ambition: Ambition | null
): Range {
  const featureBase: Record<FeatureCount, Range> = {
    f1_2: { min: 500, max: 850 },
    f3_5: { min: 800, max: 1100 },
    f6_plus: { min: 1000, max: 1200 },
  };

  let range = featureCount ? featureBase[featureCount] : { min: 500, max: 850 };

  if (platform === "web_mobile") {
    range = rangeAdd(range, { min: 250, max: 650 });
  } else if (platform === "native") {
    range = rangeAdd(range, { min: 700, max: 1400 });
  }

  if (adminLevel === "simple") {
    range = rangeAdd(range, { min: 120, max: 250 });
  } else if (adminLevel === "advanced") {
    range = rangeAdd(range, { min: 260, max: 500 });
  }

  if (timeline === "lt1") {
    range = applyFactor(range, 1.1);
  }

  if (ambition === "scalable") {
    range = applyFactor(range, 1.08);
  }

  if (platform === "web") {
    range = clampRange(range, 1200);
  }

  return range;
}

function getDesignRange(
  designLevel: DesignLevel | null,
  platform: Platform | null,
  ambition: Ambition | null
): Range {
  const base: Record<DesignLevel, Range> = {
    template: { min: 80, max: 220 },
    custom_light: { min: 250, max: 600 },
    premium: { min: 500, max: 1100 },
  };

  let range = designLevel ? base[designLevel] : base.template;

  if (platform === "web_mobile") {
    range = rangeAdd(range, { min: 80, max: 180 });
  } else if (platform === "native") {
    range = rangeAdd(range, { min: 180, max: 350 });
  }

  if (ambition === "scalable") {
    range = applyFactor(range, 1.05);
  }

  return range;
}

function getIntegrationRange(
  integrationLevel: IntegrationLevel | null,
  advancedFeature: AdvancedFeature | null
): Range {
  const integrationBase: Record<IntegrationLevel, Range> = {
    none_simple: { min: 100, max: 250 },
    medium: { min: 250, max: 550 },
    complex: { min: 500, max: 1000 },
  };

  let range = integrationLevel ? integrationBase[integrationLevel] : integrationBase.none_simple;

  if (advancedFeature === "realtime") {
    range = rangeAdd(range, { min: 120, max: 260 });
  } else if (advancedFeature === "ai") {
    range = rangeAdd(range, { min: 250, max: 600 });
  }

  return range;
}

function buildCostBreakdown(
  featureCount: FeatureCount | null,
  designLevel: DesignLevel | null,
  integrationLevel: IntegrationLevel | null,
  advancedFeature: AdvancedFeature | null,
  platform: Platform | null,
  adminLevel: AdminLevel | null,
  timeline: Timeline | null,
  ambition: Ambition | null
): CostBreakdown {
  const development = getDevelopmentRange(featureCount, platform, adminLevel, timeline, ambition);
  const design = getDesignRange(designLevel, platform, ambition);
  const integrations = getIntegrationRange(integrationLevel, advancedFeature);

  const subtotal = rangeAdd(rangeAdd(development, design), integrations);
  const maintenance = {
    min: Math.round(subtotal.min * 0.08),
    max: Math.round(subtotal.max * 0.1),
  };
  const total = rangeAdd(subtotal, maintenance);

  return { development, design, integrations, maintenance, total };
}

const steps = [
  "Ambition & calendrier",
  "Complexité fonctionnelle",
  "Design & plateforme",
  "Estimation & diagnostic",
] as const;

export default function MvpEstimatorFlow() {
  const [step, setStep] = useState(0);

  const [ambition, setAmbition] = useState<Ambition | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  const [featureCount, setFeatureCount] = useState<FeatureCount | null>(null);
  const [integrationLevel, setIntegrationLevel] = useState<IntegrationLevel | null>(null);
  const [advancedFeature, setAdvancedFeature] = useState<AdvancedFeature | null>(null);

  const [designLevel, setDesignLevel] = useState<DesignLevel | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [adminLevel, setAdminLevel] = useState<AdminLevel | null>(null);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const totalScore = useMemo(() => {
    if (!ambition || !timeline || !featureCount || !integrationLevel || !advancedFeature) {
      return 0;
    }

    if (!designLevel || !platform || !adminLevel) {
      return 0;
    }

    return (
      optionScore(ambition, scoreMaps.ambition) +
      optionScore(timeline, scoreMaps.timeline) +
      optionScore(featureCount, scoreMaps.featureCount) +
      optionScore(integrationLevel, scoreMaps.integration) +
      optionScore(advancedFeature, scoreMaps.advanced) +
      optionScore(designLevel, scoreMaps.design) +
      optionScore(platform, scoreMaps.platform) +
      optionScore(adminLevel, scoreMaps.admin)
    );
  }, [
    ambition,
    timeline,
    featureCount,
    integrationLevel,
    advancedFeature,
    designLevel,
    platform,
    adminLevel,
  ]);

  const costBreakdown = useMemo(
    () =>
      buildCostBreakdown(
        featureCount,
        designLevel,
        integrationLevel,
        advancedFeature,
        platform,
        adminLevel,
        timeline,
        ambition
      ),
    [
      featureCount,
      designLevel,
      integrationLevel,
      advancedFeature,
      platform,
      adminLevel,
      timeline,
      ambition,
    ]
  );

  const estimatedRange = costBreakdown.total;
  const showCustomQuoteWarning = estimatedRange.max >= 5000;
  const noCodeRange = {
    min: Math.round(estimatedRange.min * 0.5),
    max: Math.round(estimatedRange.max * 0.5),
  };
  const freelanceRange = {
    min: Math.round(estimatedRange.min * 0.6),
    max: Math.round(estimatedRange.max * 0.6),
  };
  const premiumAgencyRange = {
    min: Math.round(estimatedRange.min * 1.5),
    max: Math.round(estimatedRange.max * 1.5),
  };

  const progress = (step / (steps.length - 1)) * 100;
  const remaining = Math.max(0, steps.length - (step + 1));

  const canSubmitLead = consent && /.+@.+\..+/.test(email.trim()) && firstName.trim().length > 1;

  const handleAmbitionSelect = (value: Ambition) => {
    setAmbition(value);
    if (timeline) setStep(1);
  };

  const handleTimelineSelect = (value: Timeline) => {
    setTimeline(value);
    if (ambition) setStep(1);
  };

  const handleFeatureCountSelect = (value: FeatureCount) => {
    setFeatureCount(value);
    if (integrationLevel && advancedFeature) setStep(2);
  };

  const handleIntegrationSelect = (value: IntegrationLevel) => {
    setIntegrationLevel(value);
    if (featureCount && advancedFeature) setStep(2);
  };

  const handleAdvancedSelect = (value: AdvancedFeature) => {
    setAdvancedFeature(value);
    if (featureCount && integrationLevel) setStep(2);
  };

  const handleDesignSelect = (value: DesignLevel) => {
    setDesignLevel(value);
    if (platform && adminLevel) setStep(3);
  };

  const handlePlatformSelect = (value: Platform) => {
    setPlatform(value);
    if (designLevel && adminLevel) setStep(3);
  };

  const handleAdminSelect = (value: AdminLevel) => {
    setAdminLevel(value);
    if (designLevel && platform) setStep(3);
  };

  const submitLead = async () => {
    if (!canSubmitLead || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      const response = await fetch("/api/estimator-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim(),
          consent,
          estimateMin: estimatedRange.min,
          estimateMax: estimatedRange.max,
          totalScore,
          answers: {
            ambition,
            timeline,
            featureCount,
            integrationLevel,
            advancedFeature,
            designLevel,
            platform,
            adminLevel,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("submission_failed");
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error(error);
      setSubmitError("Impossible d'envoyer la demande. Réessayez dans un instant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/30">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6D28D9]">
          Mini Calculateur MVP
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
          Évaluez votre budget MVP en 4 étapes
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
          {remaining > 0 ? `Plus que ${remaining} étape${remaining > 1 ? "s" : ""}.` : "Estimation terminée."}
        </p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {steps[step]} - {Math.round(progress)}%
        </div>
      </header>

      <div className="mt-6 space-y-5">
        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Quel est votre niveau d’ambition pour ce MVP ?
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  {
                    key: "validation" as const,
                    label: "Validation rapide",
                    helper: "Tester une idée vite",
                  },
                  {
                    key: "base" as const,
                    label: "Produit vendable",
                    helper: "2-4 fonctionnalités clés",
                  },
                  {
                    key: "scalable" as const,
                    label: "Base scalable",
                    helper: "Fondation pour grandir",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleAmbitionSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      ambition === item.key
                        ? "border-[#6D28D9] bg-violet-50 text-[#111827] dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Quand souhaitez-vous lancer ?
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "lt1" as const, label: "< 1 mois", helper: "Livraison rush" },
                  { key: "m1_2" as const, label: "1 - 2 mois", helper: "Cadence standard" },
                  { key: "gt3" as const, label: "3 mois +", helper: "Planning progressif" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTimelineSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      timeline === item.key
                        ? "border-[#6D28D9] bg-violet-50 text-[#111827] dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Combien de fonctionnalités clés ?
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "f1_2" as const, label: "1-2", helper: "MVP minimal" },
                  { key: "f3_5" as const, label: "3-5", helper: "MVP standard" },
                  { key: "f6_plus" as const, label: "6+", helper: "MVP ambitieux" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleFeatureCountSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      featureCount === item.key
                        ? "border-[#6D28D9] bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium text-[#111827] dark:text-zinc-100">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Niveau d’intégrations API ?
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "none_simple" as const, label: "Simple", helper: "Stripe/email" },
                  { key: "medium" as const, label: "Moyen", helper: "CRM/analytics" },
                  { key: "complex" as const, label: "Complexe", helper: "APIs propriétaires" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleIntegrationSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      integrationLevel === item.key
                        ? "border-[#6D28D9] bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium text-[#111827] dark:text-zinc-100">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Fonctionnalité avancée ?
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "none" as const, label: "Aucune", helper: "Scope stable" },
                  { key: "realtime" as const, label: "Temps réel", helper: "Chat/notifications" },
                  { key: "ai" as const, label: "IA", helper: "Traitement avancé" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleAdvancedSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      advancedFeature === item.key
                        ? "border-[#6D28D9] bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium text-[#111827] dark:text-zinc-100">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Niveau de design
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "template" as const, label: "Template", helper: "Rapide et sobre" },
                  { key: "custom_light" as const, label: "Sur mesure", helper: "Branding léger" },
                  { key: "premium" as const, label: "Premium", helper: "UI poussée" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleDesignSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      designLevel === item.key
                        ? "border-[#6D28D9] bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium text-[#111827] dark:text-zinc-100">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Plateforme
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "web" as const, label: "Web", helper: "Budget de base" },
                  { key: "web_mobile" as const, label: "Web + mobile", helper: "Coût modéré" },
                  { key: "native" as const, label: "Natif", helper: "Coût élevé" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePlatformSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      platform === item.key
                        ? "border-[#6D28D9] bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium text-[#111827] dark:text-zinc-100">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#111827] dark:text-zinc-200">
                Back-office / Admin
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: "none" as const, label: "Aucun", helper: "Simple" },
                  { key: "simple" as const, label: "Simple", helper: "Gestion basique" },
                  { key: "advanced" as const, label: "Avancé", helper: "Rôles/reporting" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleAdminSelect(item.key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      adminLevel === item.key
                        ? "border-[#6D28D9] bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="font-medium text-[#111827] dark:text-zinc-100">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-zinc-400">{item.helper}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm text-[#6B7280] dark:text-zinc-400">Votre fourchette estimée</p>
              <p className="mt-1 text-2xl font-semibold text-[#111827] dark:text-zinc-100">
                {formatEuros(estimatedRange.min)} - {formatEuros(estimatedRange.max)}
              </p>

              <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-[#6D28D9]"
                  style={{
                    width: `${Math.min(100, Math.max(12, (estimatedRange.max / 5000) * 100))}%`,
                  }}
                />
              </div>

              {showCustomQuoteWarning ? (
                <p className="mt-3 text-xs text-[#6B7280] dark:text-zinc-400">
                  Votre projet dépasse probablement 5 000 €. Un devis sur mesure est recommandé.
                </p>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900/50">
                    <th className="px-3 py-2 font-medium text-[#111827] dark:text-zinc-200">Éléments clés</th>
                    <th className="px-3 py-2 font-medium text-[#111827] dark:text-zinc-200">Fourchette</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <td className="px-3 py-2 text-[#6B7280] dark:text-zinc-400">Développement</td>
                    <td className="px-3 py-2 text-[#111827] dark:text-zinc-200">
                      {formatEuros(costBreakdown.development.min)} - {formatEuros(costBreakdown.development.max)}
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <td className="px-3 py-2 text-[#6B7280] dark:text-zinc-400">Design & UX</td>
                    <td className="px-3 py-2 text-[#111827] dark:text-zinc-200">
                      {formatEuros(costBreakdown.design.min)} - {formatEuros(costBreakdown.design.max)}
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <td className="px-3 py-2 text-[#6B7280] dark:text-zinc-400">Intégrations & API</td>
                    <td className="px-3 py-2 text-[#111827] dark:text-zinc-200">
                      {formatEuros(costBreakdown.integrations.min)} - {formatEuros(costBreakdown.integrations.max)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-[#6B7280] dark:text-zinc-400">Maintenance</td>
                    <td className="px-3 py-2 text-[#111827] dark:text-zinc-200">
                      {formatEuros(costBreakdown.maintenance.min)} - {formatEuros(costBreakdown.maintenance.max)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              <p className="font-medium text-[#111827] dark:text-zinc-200">Comparatif rapide</p>
              <ul className="mt-2 space-y-1 text-[#6B7280] dark:text-zinc-400">
                <li>
                  Freelance: {formatEuros(freelanceRange.min)} - {formatEuros(freelanceRange.max)}
                </li>
                <li>
                  No-code: {formatEuros(noCodeRange.min)} - {formatEuros(noCodeRange.max)}
                </li>
                <li>
                  Agence premium: {formatEuros(premiumAgencyRange.min)} - {formatEuros(premiumAgencyRange.max)}
                </li>
              </ul>
            </div>

            {totalScore <= 3 ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-[#6B7280] dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                Pour un budget très contraint, des solutions no-code peuvent être une bonne étape de validation avant une version sur mesure.
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm text-[#111827] dark:text-zinc-200">
                Prénom
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="Votre prénom"
                />
              </label>

              <label className="text-sm text-[#111827] dark:text-zinc-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  placeholder="vous@startup.com"
                />
              </label>
            </div>

            <label className="flex items-start gap-2 text-xs text-[#6B7280] dark:text-zinc-400">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              J’accepte d’être contacté(e) pour un diagnostic gratuit et une estimation détaillée.
            </label>

            <div>
              <button
                type="button"
                disabled={!canSubmitLead || isSubmitting}
                onClick={submitLead}
                className={`inline-flex rounded-full px-5 py-2 text-sm font-semibold text-white ${
                  canSubmitLead && !isSubmitting
                    ? "bg-[#6D28D9] hover:bg-violet-700"
                    : "cursor-not-allowed bg-zinc-400"
                }`}
              >
                {isSubmitting ? "Envoi..." : "Planifier un diagnostic gratuit"}
              </button>
              <p className="mt-2 text-xs text-[#6B7280] dark:text-zinc-400">
                Seulement 3 créneaux disponibles cette semaine.
              </p>
              {submitSuccess ? (
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                  Merci, votre demande a bien été envoyée.
                </p>
              ) : null}
              {submitError ? (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{submitError}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((prev) => Math.max(0, prev - 1))}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-[#111827] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
        >
          Précédent
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))}
            className="rounded-md bg-[#6D28D9] px-3 py-1.5 text-sm font-medium text-white"
          >
            Suivant
          </button>
        ) : null}
      </div>
    </section>
  );
}
