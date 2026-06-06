import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, Plus, FileText, Tag as TagIcon, Sparkles, Clock, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData, type Note } from "@/hooks/use-app-data";
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

  // Magazine hero: featured + recent
  const showHero = !q && !activeTag && !folder && view === "all" && filtered.length > 0;
  const pinned = filtered.filter((n) => n.pinned);
  const featured: Note | undefined = pinned[0] ?? filtered[0];
  const secondary: Note[] = (pinned.length > 1 ? pinned.slice(1) : filtered.filter((n) => n.id !== featured?.id)).slice(0, 2);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
    <div>
      {showHero && featured && (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card/40 p-1 shadow-card">
          <div className="bg-grid grid gap-4 rounded-[22px] bg-gradient-to-br from-transparent via-transparent to-primary/10 p-5 md:grid-cols-3 md:p-7">
            <button onClick={() => openEditor(featured.id)} className="group relative col-span-2 overflow-hidden rounded-2xl bg-gradient-aurora p-6 text-left text-primary-foreground shadow-glow transition hover:scale-[1.005] md:p-8">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                <Sparkles className="h-3 w-3" /> Featured
              </div>
              <h2 className="font-display text-2xl font-bold leading-tight md:text-4xl">{featured.title || "Untitled"}</h2>
              <p className="mt-2 line-clamp-3 max-w-2xl text-sm text-white/85 md:text-base">{featured.content || "Open to start writing…"}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/75">
                {featured.pinned && <span className="inline-flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>}
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(featured.updated_at).toLocaleDateString()}</span>
                <span>{featured.word_count} words</span>
              </div>
            </button>
            <div className="grid gap-3">
              {secondary.map((n) => (
                <button key={n.id} onClick={() => openEditor(n.id)} className="group rounded-2xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-glow">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {n.pinned ? <Pin className="h-3 w-3 text-primary" /> : <Clock className="h-3 w-3" />}
                    {n.pinned ? "Pinned" : "Recent"}
                  </div>
                  <h3 className="line-clamp-1 font-display text-base font-semibold">{n.title || "Untitled"}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content || "Empty note"}</p>
                </button>
              ))}
              {secondary.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Pin a few notes to feature them here.
                </div>
              )}
              <div className="rounded-2xl border border-border bg-gradient-aurora/10 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">This workspace</div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  <Stat label="Total" value={notes.filter((n) => !n.deleted_at).length} />
                  <Stat label="Pinned" value={notes.filter((n) => n.pinned && !n.archived && !n.deleted_at).length} />
                  <Stat label="This week" value={notes.filter((n) => !n.deleted_at && (Date.now() - new Date(n.updated_at).getTime()) < 7 * 86400000).length} />
                  <Stat label="Words" value={notes.reduce((s, n) => s + (n.deleted_at ? 0 : n.word_count), 0)} />
                </div>
                {allTags.length > 0 && (
                  <div className="mt-3 border-t border-border/60 pt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top tags</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {topTags.map((t) => (
                        <button key={t.tag} onClick={() => setActiveTag(activeTag === t.tag ? null : t.tag)}>
                          <Badge variant="secondary" className="cursor-pointer text-[10px]">#{t.tag} <span className="ml-1 opacity-60">{t.count}</span></Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}

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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Empty({ onCreate, hasFilter }: { onCreate: () => void; hasFilter: boolean }) {
  const { seedDemo } = useAppData();
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/30 p-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
        <FileText className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold">{hasFilter ? "No matches" : "Your canvas is blank"}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilter ? "Try a different search or clear your filters." : "Tap below to write your first note. Markdown, AI, tags, colors and reminders are all built-in."}
      </p>
      {!hasFilter && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={onCreate} className="bg-gradient-primary shadow-glow"><Plus className="mr-1 h-4 w-4" /> Create your first note</Button>
          <Button variant="outline" onClick={seedDemo}>✨ Load demo workspace</Button>
        </div>
      )}
    </div>
  );
}
