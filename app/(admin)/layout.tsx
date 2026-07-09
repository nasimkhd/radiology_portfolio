import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar
        fullName={profile ? `${profile.fName} ${profile.lName}` : "Admin"}
        email={profile?.email ?? ""}
      />
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
