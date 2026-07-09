import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { MobileNav, type NavLink } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getViewerContext } from "@/lib/auth";

export async function SiteHeader() {
  const { user, profile, isApprovedMember, isAdmin } = await getViewerContext();

  const links: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/videos", label: "Videos" },
    { href: "/about", label: "About" },
  ];
  if (isApprovedMember) links.push({ href: "/dashboard", label: "Dashboard" });
  if (isAdmin) links.push({ href: "/admin", label: "Admin" });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && profile ? (
            <>
              {isApprovedMember && (
                <Badge variant="members" className="hidden sm:inline-flex">
                  {isAdmin ? "Admin" : "Approved Member"}
                </Badge>
              )}
              <div className="hidden md:block">
                <UserMenu
                  fullName={`${profile.fName} ${profile.lName}`}
                  email={profile.email}
                  isAdmin={isAdmin}
                />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <CircleUserRound className="size-4" />
                Request Access
              </Link>
            </div>
          )}

          <MobileNav links={links} isAuthed={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
