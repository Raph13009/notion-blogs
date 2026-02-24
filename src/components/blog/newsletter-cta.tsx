"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

interface NewsletterCtaProps {
  blogSlug?: string;
  blogTitle?: string;
}

export function NewsletterCta({ blogSlug, blogTitle }: NewsletterCtaProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSuccess(false);

    const normalizedEmail = email.trim();
    if (!/.+@.+\..+/.test(normalizedEmail)) {
      setError("Merci de renseigner un email valide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/blog-cta-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          blogSlug,
          blogTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("submission_failed");
      }

      setIsSuccess(true);
      setEmail("");
    } catch {
      setError("Envoi impossible pour le moment. Réessayez dans quelques minutes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-2xl font-semibold tracking-tight text-[#111827] dark:text-zinc-100">
        Prêt à passer de l’idée au produit ?
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#475569] dark:text-zinc-300">
        Si vous cherchez un partenaire pour :
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-[#475569] dark:text-zinc-300">
        <li>structurer votre MVP</li>
        <li>construire une base technique solide</li>
        <li>éviter les erreurs coûteuses</li>
        <li>lancer en 4 à 6 semaines</li>
      </ul>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="blog-cta-email" className="sr-only">
          Email
        </label>
        <input
          id="blog-cta-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Votre email professionnel"
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-[#111827] outline-none transition-colors placeholder:text-zinc-400 focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          required
          autoComplete="email"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-md bg-[#111827] px-5 text-white transition-colors hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Envoi..." : "👉 Discutons de votre projet"}
        </Button>
      </form>

      {isSuccess ? (
        <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
          Bien envoyé. Je vous recontacte rapidement.
        </p>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </section>
  );
}
