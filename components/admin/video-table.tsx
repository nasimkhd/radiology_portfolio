"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Send, Archive, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { setVideoStatus, deleteVideo } from "@/app/(admin)/admin/actions";
import type { AccessLevel, VideoStatus } from "@/lib/types";

export interface AdminVideoRow {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  access_level: AccessLevel;
  status: VideoStatus;
  display_order: number;
}

function statusBadge(status: VideoStatus) {
  if (status === "published") return <Badge variant="success">Published</Badge>;
  if (status === "archived") return <Badge variant="outline">Archived</Badge>;
  return <Badge variant="warning">Draft</Badge>;
}

export function VideoTable({ videos }: { videos: AdminVideoRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeStatus(id: string, status: VideoStatus) {
    setBusyId(id);
    await setVideoStatus(id, status);
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this video permanently? This cannot be undone.")) return;
    setBusyId(id);
    await deleteVideo(id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Access</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No videos yet. Add your first video.
                </td>
              </tr>
            )}
            {videos.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-navy">{v.title}</p>
                  <p className="text-xs text-muted-foreground">/{v.slug}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {v.category ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {v.access_level === "public" ? (
                    <Badge variant="preview">Public</Badge>
                  ) : (
                    <Badge variant="members">Members</Badge>
                  )}
                </td>
                <td className="px-4 py-3">{statusBadge(v.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/videos/${v.id}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-navy"
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    {v.status !== "published" ? (
                      <button
                        type="button"
                        onClick={() => changeStatus(v.id, "published")}
                        disabled={busyId === v.id}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-members/10 hover:text-members"
                        aria-label="Publish"
                        title="Publish"
                      >
                        <Send className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => changeStatus(v.id, "draft")}
                        disabled={busyId === v.id}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-navy"
                        aria-label="Unpublish"
                        title="Move to draft"
                      >
                        <Undo2 className="size-4" />
                      </button>
                    )}
                    {v.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(v.id, "archived")}
                        disabled={busyId === v.id}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-navy"
                        aria-label="Archive"
                        title="Archive"
                      >
                        <Archive className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(v.id)}
                      disabled={busyId === v.id}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
