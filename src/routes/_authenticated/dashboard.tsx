import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Plus, FileText, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/hooks/use-app-data";
import { NoteCard } from "@/components/NoteCard";
import { cn } from "@/lib/utils";

const search = z.object({
  view: z.enum(["all", "pinned", "archived"]).optional(),
  folder: z.string().optional(),
  tag: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Noctis" }] }),
  validateSearch: search,
  component: Dashboard,
});

function Dashboard() {
  const { view = "all", folder, tag } = Route.useSearch();
  const { notes, folders, loading } = useAppData();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [activeTag, setActiveTag] = useState<string | null>(tag ?? null);
  const [q, setQ] = useState("");

  useEffect(() => { setActiveTag(tag ?? null); }, [tag]);
  useEffect(() => {
    const h = (e: Event) => setQ((e as CustomEvent).detail || "");
    setQ((window as any).__noctisSearch || "");
    window.addEventListener("noctis:search", h as EventListener);
    return () => window.removeEventListener("noctis:search", h as EventListener);
  }, []);

  const folderObj = folder ? folders.find((f) => f.id === folder) : null;

  const filtered = useMemo(() => {
    let arr = notes.filter((n) => !n.deleted_at);
    if (folder) arr = arr.filter((n) => n.folder_id === folder);
    if (view === "pinned") arr = arr.filter((n) => n.pinned && !n.archived);
    else if (view === "archived") arr = arr.filter((n) => n.archived);
    else arr = arr.filter((n) => !n.archived);
    if (activeTag) arr = arr.filter((n) => n.tags.includes(activeTag));
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter((n) => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.tags.some((t) => t.includes(s)));
    }
    return arr;
  }, [notes, view, folder, activeTag, q]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    notes.filter((n) => !n.deleted_at).forEach((n) => n.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [notes]);

  const heading = folderObj ? folderObj.name : view === "pinned" ? "Pinned" : view === "archived" ? "Archive" : "All notes";
  const openEditor = (id: string | null) => window.dispatchEvent(new CustomEvent("noctis:openEditor", { detail: id }));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">{heading}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "note" : "notes"}{q && ` matching "${q}"`}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/50 p-1">
          <Button size="icon" variant={layout === "grid" ? "default" : "ghost"} className="h-7 w-7" onClick={() => setLayout("grid")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant={layout === "list" ? "default" : "ghost"} className="h-7 w-7" onClick={() => setLayout("list")}><List className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {allTags.slice(0, 20).map((t) => (
            <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)}>
              <Badge variant={activeTag === t ? "default" : "secondary"} className="cursor-pointer text-[10px]">#{t}</Badge>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card/50" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Empty onCreate={() => openEditor(null)} hasFilter={!!q || !!activeTag || !!folder} />
      ) : (
        <div className={cn(layout === "grid" ? "columns-1 gap-4 sm:columns-2 lg:columns-2 xl:columns-3" : "space-y-2")}>
          <AnimatePresence mode="popLayout">
            {filtered.map((n) => (
              <NoteCard key={n.id} note={n} variant={layout} onClick={() => openEditor(n.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Empty({ onCreate, hasFilter }: { onCreate: () => void; hasFilter: boolean }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/30 p-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
        <FileText className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold">{hasFilter ? "No matches" : "Your canvas is blank"}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilter ? "Try a different search or clear your filters." : "Tap below to write your first note. Markdown, tags, colors and reminders are all built-in."}
      </p>
      {!hasFilter && <Button onClick={onCreate} className="mt-6 bg-gradient-primary shadow-glow"><Plus className="mr-1 h-4 w-4" /> Create your first note</Button>}
    </div>
  );
}
