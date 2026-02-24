import Image from "next/image";
import { cn } from "@/lib/utils";
import GrainyBackground from "@/components/blog/grainy-background";

interface ArticleVisualProps {
  slug: string;
  title: string;
  imageUrl?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function ArticleVisual({
  slug,
  title,
  imageUrl,
  sizes,
  priority = false,
  className,
  imageClassName,
}: ArticleVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-[#F3F4F6] dark:border-zinc-800 dark:bg-zinc-800",
        className
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <GrainyBackground seed={slug} />
      )}
    </div>
  );
}
