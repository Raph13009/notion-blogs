"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function formatEuros(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)}€`;
}

export default function MiniMvpCalculator() {
  const [features, setFeatures] = useState(8);
  const [auth, setAuth] = useState(true);
  const [stripe, setStripe] = useState(false);
  const [admin, setAdmin] = useState(true);
  const [multiTenant, setMultiTenant] = useState(false);

  const estimate = useMemo(() => {
    const baseMin = 3500;
    const baseMax = 5500;
    const featureMin = features * 300;
    const featureMax = features * 600;

    const authCost = auth ? [700, 1400] : [0, 0];
    const stripeCost = stripe ? [1200, 2600] : [0, 0];
    const adminCost = admin ? [1000, 2200] : [0, 0];
    const multiTenantCost = multiTenant ? [1800, 4200] : [0, 0];

    const min =
      baseMin + featureMin + authCost[0] + stripeCost[0] + adminCost[0] + multiTenantCost[0];
    const max =
      baseMax + featureMax + authCost[1] + stripeCost[1] + adminCost[1] + multiTenantCost[1];

    return { min, max };
  }, [features, auth, stripe, admin, multiTenant]);

  const discussHref = `mailto:hello@boostaiconsulting.com?subject=Estimation%20MVP&body=Bonjour,%0D%0A%0D%0AMon%20estimation%20MVP%20est%20de%20${encodeURIComponent(
    `${formatEuros(estimate.min)} à ${formatEuros(estimate.max)}`
  )}.%0D%0AFeatures:%20${features}%0D%0AAuth:%20${auth ? "Oui" : "Non"}%0D%0AStripe:%20${
    stripe ? "Oui" : "Non"
  }%0D%0AAdmin:%20${admin ? "Oui" : "Non"}%0D%0AMulti-tenant:%20${
    multiTenant ? "Oui" : "Non"
  }`;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_12px_30px_rgba(17,24,39,0.08)] sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-200">
        Mini calculateur MVP
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#111827] dark:text-white">
        Estimez une fourchette budgétaire en 20 secondes
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200">
          <span className="block text-zinc-500 dark:text-zinc-400">Nombre de features</span>
          <input
            type="number"
            min={1}
            max={40}
            value={features}
            onChange={(e) => setFeatures(Math.max(1, Number(e.target.value) || 1))}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-[#111827] outline-none ring-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Authentification", value: auth, set: setAuth },
            { label: "Paiement Stripe", value: stripe, set: setStripe },
            { label: "Admin panel", value: admin, set: setAdmin },
            { label: "Multi-tenant", value: multiTenant, set: setMultiTenant },
          ].map((item) => (
            <label
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200"
            >
              <span>{item.label}</span>
              <select
                value={item.value ? "yes" : "no"}
                onChange={(e) => item.set(e.target.value === "yes")}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-[#111827] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              >
                <option value="yes">Oui</option>
                <option value="no">Non</option>
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-violet-300 bg-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-violet-400/30 dark:bg-violet-500/15">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Fourchette estimée</p>
        <p className="text-xl font-semibold text-[#111827] dark:text-white">
          {formatEuros(estimate.min)} - {formatEuros(estimate.max)}
        </p>
      </div>

      <div className="mt-5">
        <Link
          href={discussHref}
          className="inline-flex rounded-full border border-violet-300 bg-violet-50 px-5 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-violet-100 dark:hover:bg-violet-500/25"
        >
          Discuter de mon projet
        </Link>
      </div>
    </section>
  );
}
