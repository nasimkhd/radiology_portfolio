import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Brand mark: Radio From Scratch logo (icon row + wordmark). */
export function Logo({
  className,
  href = "/",
  size = "default",
}: {
  className?: string;
  href?: string;
  size?: "default" | "compact";
}) {
  return (
    <Link
      href={href}
      className={cn("flex shrink-0 items-center group", className)}
      aria-label="Radio From Scratch home"
    >
      <Image
        src="/radio-from-scratch-logo.png"
        alt="Radio From Scratch"
        width={140}
        height={100}
        priority
        className={cn(
          "w-auto transition-opacity group-hover:opacity-90",
          size === "compact" ? "h-10" : "h-14"
        )}
      />
    </Link>
  );
}
