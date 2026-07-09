import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Brand mark: the Radio From Scratch logo (compact icon + RfS monogram). */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center group", className)}
      aria-label="Radio From Scratch home"
    >
      <Image
        src="/radio-from-scratch-mark.png"
        alt="Radio From Scratch"
        width={637}
        height={256}
        priority
        className="h-11 w-auto"
      />
    </Link>
  );
}
