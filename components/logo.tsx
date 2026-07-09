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
        width={580}
        height={373}
        priority
        className={cn(
          "h-auto transition-opacity group-hover:opacity-90",
          size === "compact" ? "w-[110px]" : "w-[140px]"
        )}
      />
    </Link>
  );
}
