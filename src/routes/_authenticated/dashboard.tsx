import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Sparkles, LogOut, FileText, Pin, Archive, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoteCard, type Note, type NoteColor } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Noctis" }] }),
  component: Dashboard,
});

type Filter = "all" | "pinned" | "archived";

function Dashboard() {
  const { user, signOut } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setNotes((data as Note[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    let n = notes;
    if (filter === "pinned") n = n.filter((x) => x.pinned && !x.archived);
    else if (filter === "archived") n = n.filter((x) => x.archived);
    else n = n.filter((x) => !x.archived);
    if (tagFilter) n = n.filter((x) => x.tags.includes(tagFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      n = n.filter((x) =>
        x.title.toLowerCase().includes(q) ||
        x.content.toLowerCase().includes(q) ||
        x.tags.some((t) => t.includes(q))
      );
    }
    return n;
  }, [notes, filter, tagFilter, search]);

  const counts = useMemo(() => ({
    all: notes.filter((n) => !n.archived).length,
    pinned: notes.filter((n) => n.pinned && !n.archived).length,
    archived: notes.filter((n) => n.archived).length,
  }), [notes]);

  const openNew = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (n: Note) => { setEditing(n); setEditorOpen(true); };

  const handleSave = async (input: { title: string; content: string; color: NoteColor; tags: string[] }) => {
    if (!user) return;
    if (!input.title && !input.content) { toast.error("Add a title or some content"); return; }
    if (editing) {
      const { error } = await supabase.from("notes").update(input).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Note updated");
    } else {
      const { error } = await supabase.from("notes").insert({ ...input, user_id: user.id });
      if (error) return toast.error(error.message);
      toast.success("Note created");
    }
    setEditorOpen(false);
    load();
  };

  const togglePin = async (n: Note) => {
    await supabase.from("notes").update({ pinned: !n.pinned }).eq("id", n.id);
    load();
  };
  const toggleArchive = async (n: Note) => {
    await supabase.from("notes").update({ archived: !n.archived }).eq("id", n.id);
    toast.success(n.archived ? "Restored" : "Archived");
    load();
  };
  const remove = async (n: Note) => {
    await supabase.from("notes").delete().eq("id", n.id);
    toast.success("Note deleted");
    load();
  };
  const setColor = async (n: Note, c: NoteColor) => {
    await supabase.from("notes").update({ color: c }).eq("id", n.id);
    load();
  };

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden font-display text-lg font-bold sm:inline">Noctis</span>
          </Link>
          <div className="relative ml-2 flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes, tags, content…"
              className="pl-9"
            />
          </div>
          <Button onClick={openNew} className="bg-gradient-primary shadow-glow">
            <Plus className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">New note</span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">{initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="container mx-auto grid gap-6 px-4 py-6 md:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div className="space-y-1">
            <SidebarItem icon={FileText} label="All notes" count={counts.all} active={filter === "all"} onClick={() => { setFilter("all"); setTagFilter(null); }} />
            <SidebarItem icon={Pin} label="Pinned" count={counts.pinned} active={filter === "pinned"} onClick={() => { setFilter("pinned"); setTagFilter(null); }} />
            <SidebarItem icon={Archive} label="Archive" count={counts.archived} active={filter === "archived"} onClick={() => { setFilter("archived"); setTagFilter(null); }} />
          </div>
          {allTags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TagIcon className="h-3 w-3" /> Tags
              </div>
              <div className="flex flex-wrap gap-1 px-1">
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTagFilter(tagFilter === t ? null : t)}
                  >
                    <Badge variant={tagFilter === t ? "default" : "secondary"} className="cursor-pointer hover:bg-primary hover:text-primary-foreground">#{t}</Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold capitalize">
              {tagFilter ? `#${tagFilter}` : filter === "all" ? "All notes" : filter}
            </h1>
            <span className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "note" : "notes"}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onCreate={openNew} hasSearch={!!search || !!tagFilter} />
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {filtered.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onClick={() => openEdit(n)}
                  onTogglePin={() => togglePin(n)}
                  onToggleArchive={() => toggleArchive(n)}
                  onDelete={() => remove(n)}
                  onColor={(c) => setColor(n, c)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <NoteEditor open={editorOpen} note={editing} onClose={() => setEditorOpen(false)} onSave={handleSave} />
    </div>
  );
}

function SidebarItem({ icon: Icon, label, count, active, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "hover:bg-muted"
      )}
    >
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
      <span className={cn("rounded-full px-2 text-xs", active ? "bg-white/20" : "bg-muted text-muted-foreground")}>{count}</span>
    </button>
  );
}

function EmptyState({ onCreate, hasSearch }: { onCreate: () => void; hasSearch: boolean }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/30 p-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
        <FileText className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold">{hasSearch ? "No matches" : "Your canvas is blank"}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasSearch ? "Try a different search or clear your filters." : "Tap below to write your first note. Tags, colors, and pins are all at your fingertips."}
      </p>
      {!hasSearch && (
        <Button onClick={onCreate} className="mt-6 bg-gradient-primary shadow-glow">
          <Plus className="mr-1 h-4 w-4" /> Create your first note
        </Button>
      )}
    </div>
  );
}
