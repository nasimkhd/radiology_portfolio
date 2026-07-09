import { cn } from "@/lib/utils";

export function AuthBackground({
  variant,
  className,
}: {
  variant: "sign-in" | "sign-up";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/20 to-background" />

      {variant === "sign-in" ? (
        <>
          <div className="absolute -bottom-28 -left-28 size-[26rem] rounded-full border border-primary/10" />
          <div className="absolute -bottom-20 left-[18%] size-[18rem] rounded-full border border-primary/[0.07]" />
          <div className="absolute -bottom-32 -right-20 size-[22rem] rounded-full border border-primary/[0.06]" />
        </>
      ) : (
        <>
          <div className="absolute -left-40 top-[20%] size-[32rem] rounded-full bg-primary/[0.04]" />
          <div className="absolute -right-32 bottom-0 size-[28rem] rounded-full bg-primary/[0.03]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgb(13 106 134 / 0.08) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </>
      )}
    </div>
  );
}
