import { Metadata } from "next";
import { canonicalUrl } from "@/lib/site";
import { KnowledgeLayout } from "@/components/blog/knowledge-layout";
import MvpEstimatorFlow from "@/components/blog/mvp-estimator-flow";

export const metadata: Metadata = {
  title: "Estimateur MVP",
  description: "Estimez rapidement le budget de votre MVP SaaS.",
  alternates: {
    canonical: canonicalUrl("/blog/estimateur-mvp"),
  },
};

export default function EstimatorPage() {
  return (
    <KnowledgeLayout active="estimateur">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
          Estimateur MVP
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-zinc-400">
          Un cadrage rapide pour transformer votre idée en fourchette budgétaire actionnable.
        </p>

        <div className="mt-6">
          <MvpEstimatorFlow />
        </div>
      </section>
    </KnowledgeLayout>
  );
}
