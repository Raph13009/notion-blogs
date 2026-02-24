interface StyledQuoteProps {
  children: React.ReactNode;
}

export function StyledQuote({ children }: StyledQuoteProps) {
  return (
    <blockquote className="my-10 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5 text-lg italic leading-8 text-[#334155] dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-200">
      {children}
    </blockquote>
  );
}
