import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppDataProvider, useAppData } from "@/hooks/use-app-data";
import { Sparkles, FileText, Pin, Archive, Trash2, BarChart3, Settings, Folder as FolderIcon, Plus, Search, LogOut, FolderPlus, Command as CmdIcon, MessageSquare, LayoutGrid, Network, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { NoteEditor } from "@/components/NoteEditor";
import { Logo, LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";


export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login", replace: true }); }, [loading, user, navigate]);
  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-aurora">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          <LogoMark size="lg" />
        </motion.div>
      </div>
    );
  }

  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  );
}

type EditorState = { open: boolean; id: string | null };

function Shell() {
  const { user, signOut } = useAuth();
  const { notes, folders, profile, createFolder } = useAppData();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>({ open: false, id: null });
  const [folderDlg, setFolderDlg] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [query, setQuery] = useState("");

  // global search broadcast
  useEffect(() => {
    (window as any).__noctisSearch = query;
    window.dispatchEvent(new CustomEvent("noctis:search", { detail: query }));
  }, [query]);

  // shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (mod && e.key.toLowerCase() === "n") { e.preventDefault(); setEditor({ open: true, id: null }); }
      if (e.key === "/" && !["INPUT","TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // listen for openEditor events from routes
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent).detail as string | null;
      setEditor({ open: true, id });
    };
    window.addEventListener("noctis:openEditor", onOpen as EventListener);
    return () => window.removeEventListener("noctis:openEditor", onOpen as EventListener);
  }, []);

  const activeNotes = notes.filter((n) => !n.deleted_at);
  const counts = {
    all: activeNotes.filter((n) => !n.archived).length,
    pinned: activeNotes.filter((n) => n.pinned && !n.archived).length,
    archived: activeNotes.filter((n) => n.archived).length,
    trash: notes.filter((n) => n.deleted_at).length,
  };
  const initials = (profile?.display_name || user?.email || "?").slice(0, 2).toUpperCase();
  const editingNote = editor.id ? notes.find((n) => n.id === editor.id) ?? null : null;

  const search = (location.search ?? {}) as { view?: string; folder?: string };
  const isActive = (path: string) => location.pathname === path;
  const isView = (v: string) => location.pathname === "/dashboard" && search.view === v;
  const isAllNotes = location.pathname === "/dashboard" && !search.view && !search.folder;

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-60" />
      <div className="relative">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3 md:px-6">
          <Logo to="/dashboard" size="sm" />
          <div className="relative ml-2 flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="global-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes… (press / )" className="pl-9 pr-16" />
            <button onClick={() => setPaletteOpen(true)} className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex" aria-label="Open command palette">
              <CmdIcon className="h-3 w-3" />K
            </button>
          </div>
          <Button onClick={() => setEditor({ open: true, id: null })} className="bg-mint text-primary-foreground hover:bg-mint/90 shadow-glow">
            <Plus className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">New note</span>
          </Button>
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-mint text-xs text-primary-foreground">{profile?.avatar_emoji || initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium">{profile?.display_name || user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>


      <div className="container mx-auto grid gap-6 px-4 py-6 md:px-6 lg:grid-cols-[230px_1fr]">
        <aside className="hidden space-y-6 lg:block">
          <div className="space-y-1">
            <SidebarLink to="/dashboard" search={undefined} icon={FileText} label="All notes" count={counts.all} active={isAllNotes} />
            <SidebarLink to="/dashboard" search={{ view: "pinned" }} icon={Pin} label="Pinned" count={counts.pinned} active={isView("pinned")} />
            <SidebarLink to="/dashboard" search={{ view: "archived" }} icon={Archive} label="Archive" count={counts.archived} active={isView("archived")} />
            <SidebarLink to="/trash" icon={Trash2} label="Trash" count={counts.trash} active={isActive("/trash")} />
          </div>
          <div className="space-y-1">
            <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspace</div>
            <SidebarLink to="/chat" icon={MessageSquare} label="AI Chat" active={isActive("/chat")} badge="AI" />
            <SidebarLink to="/board" icon={LayoutGrid} label="Board" active={isActive("/board")} />
            <SidebarLink to="/graph" icon={Network} label="Graph" active={isActive("/graph")} />
            <SidebarLink to="/focus" icon={Focus} label="Focus" active={isActive("/focus")} />
          </div>
          <div className="space-y-1">
            <SidebarLink to="/stats" icon={BarChart3} label="Statistics" active={isActive("/stats")} />
            <SidebarLink to="/settings" icon={Settings} label="Settings" active={isActive("/settings")} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Folders</span>
              <button onClick={() => setFolderDlg(true)} className="rounded p-1 hover:bg-muted" title="New folder"><FolderPlus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-1">
              {folders.map((f) => {
                const active = location.pathname === "/dashboard" && search.folder === f.id;
                return (
                  <Link key={f.id} to="/dashboard" search={{ folder: f.id } as any}
                    className={cn("flex items-center justify-between rounded-lg px-3 py-2 text-sm transition", active ? "bg-mint text-primary-foreground shadow-glow" : "text-foreground/80 hover:bg-muted hover:text-foreground")}>
                    <span className="flex items-center gap-2 truncate"><FolderIcon className="h-4 w-4 shrink-0" /> <span className="truncate">{f.name}</span></span>
                    <span className={cn("rounded-full px-2 text-xs", active ? "bg-background/25 text-primary-foreground" : "bg-muted text-muted-foreground")}>{activeNotes.filter((n) => n.folder_id === f.id).length}</span>
                  </Link>
                );

              })}
              {folders.length === 0 && <p className="px-3 text-xs text-muted-foreground">No folders yet</p>}
            </div>
          </div>
        </aside>

        <main className="min-w-0"><Outlet /></main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNewNote={() => setEditor({ open: true, id: null })}
        onNewFolder={() => setFolderDlg(true)}
        onOpenNote={(id) => setEditor({ open: true, id })}
      />

      <NoteEditor open={editor.open} note={editingNote} onClose={() => setEditor({ open: false, id: null })} />

      <Dialog open={folderDlg} onOpenChange={setFolderDlg}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
          <Input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Folder name" autoFocus
            onKeyDown={async (e) => { if (e.key === "Enter" && newFolder.trim()) { await createFolder(newFolder.trim()); setNewFolder(""); setFolderDlg(false); } }} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDlg(false)}>Cancel</Button>
            <Button onClick={async () => { if (newFolder.trim()) { await createFolder(newFolder.trim()); setNewFolder(""); setFolderDlg(false); } }} className="bg-mint text-primary-foreground hover:bg-mint/90">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function SidebarLink({ to, search, icon: Icon, label, count, active, badge }: { to: string; search?: any; icon: any; label: string; count?: number; active: boolean; badge?: string }) {
  return (
    <Link to={to as any} search={search as any} className={cn("flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition", active ? "bg-mint text-primary-foreground shadow-glow" : "text-foreground/80 hover:bg-muted hover:text-foreground")}>
      <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</span>
      {badge && <span className={cn("rounded-full px-1.5 text-[9px] font-bold", active ? "bg-background/25 text-primary-foreground" : "bg-mint text-primary-foreground")}>{badge}</span>}
      {count !== undefined && <span className={cn("rounded-full px-2 text-xs", active ? "bg-background/25 text-primary-foreground" : "bg-muted text-muted-foreground")}>{count}</span>}
    </Link>

  );
}
