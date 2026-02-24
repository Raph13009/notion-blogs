import { Lightbulb } from "lucide-react";

interface CalloutBoxProps {
  title: string;
  children: React.ReactNode;
}

export function CalloutBox({ title, children }: CalloutBoxProps) {
  return (
    <aside className="my-10 rounded-lg border border-violet-200 bg-violet-50/60 p-6 dark:border-violet-500/30 dark:bg-violet-500/10">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
        <Lightbulb className="h-4 w-4" />
        {title}
      </div>
      <div className="text-base leading-8 text-[#475569] dark:text-zinc-200">{children}</div>
    </aside>
  );
}
