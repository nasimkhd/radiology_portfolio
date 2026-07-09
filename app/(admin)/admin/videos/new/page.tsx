import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { VideoForm } from "@/components/admin/video-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "New Video" };

async function getCategories(): Promise<Pick<Category, "id" | "name">[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order", { ascending: true });
  return data ?? [];
}

export default async function NewVideoPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link
        href="/admin/videos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to videos
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-navy">
        Add a new video
      </h1>
      <p className="mt-1 text-muted-foreground">
        Add as a draft first, preview, then publish when ready.
      </p>

      <Card className="mt-6 p-6">
        <VideoForm categories={categories} />
      </Card>
    </div>
  );
}
