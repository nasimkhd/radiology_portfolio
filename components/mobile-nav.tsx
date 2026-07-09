"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Video,
  Info,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavLink {
  href: string;
  label: string;
}

const LINK_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/videos": Video,
  "/about": Info,
  "/dashboard": LayoutDashboard,
  "/admin": Shield,
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MobileNav({
  links,
  isAuthed,
  fullName,
  email,
}: {
  links: NavLink[];
  isAuthed: boolean;
  fullName?: string;
  email?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer = (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-navy/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="absolute left-0 top-0 flex h-full w-64 max-w-[85%] flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-5">
          <Logo size="compact" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = LINK_ICONS[link.href] ?? Home;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-secondary"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          {isAuthed && fullName ? (
            <>
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-navy-foreground">
                  {initials(fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    {fullName}
                  </p>
                  {email ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {email}
                    </p>
                  ) : null}
                </div>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-foreground/75 transition-colors hover:bg-secondary"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full",
                })}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className={buttonVariants({
                  variant: "primary",
                  className: "w-full",
                })}
              >
                Request Access
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-navy"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open && mounted && createPortal(drawer, document.body)}
    </div>
  );
}
