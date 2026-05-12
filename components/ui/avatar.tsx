import Image from "next/image";

import { cn } from "@/lib/utils";

type AvatarProps = {
  /** Stable identifier per user — email or userId. Determines the generated face. */
  seed: string;
  /** Pixel size for both the rendered SVG and the box. Default 32. */
  size?: number;
  className?: string;
};

/**
 * Generated portrait via DiceBear lorelei. Calm, hand-drawn feel; pairs with the
 * brand. Stable per-seed so the same email always yields the same face.
 */
export function Avatar({ seed, size = 32, className }: AvatarProps) {
  const url = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&radius=50`;
  return (
    <Image
      src={url}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn(
        "rounded-full border border-border/60 bg-secondary/30 object-cover",
        className,
      )}
    />
  );
}
