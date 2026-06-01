import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { FileText, Plus, Search, Trash2, BarChart3, Settings, Folder, Pin, Archive, Moon, Sun, FolderPlus, LogOut } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNewNote: () => void;
  onNewFolder: () => void;
  onOpenNote: (id: string) => void;
}

export function CommandPalette({ open, onOpenChange, onNewNote, onNewFolder, onOpenNote }: Props) {
  const { notes, folders } = useAppData();
  const { theme, toggle } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const active = notes.filter((n) => !n.deleted_at);
    if (!q.trim()) return active.slice(0, 6);
    const s = q.toLowerCase();
    return active.filter((n) =>
      n.title.toLowerCase().includes(s) ||
      n.content.toLowerCase().includes(s) ||
      n.tags.some((t) => t.includes(s))
    ).slice(0, 8);
  }, [q, notes]);

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const go = (fn: () => void) => { onOpenChange(false); fn(); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput value={q} onValueChange={setQ} placeholder="Search notes, jump anywhere…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go(onNewNote)}><Plus className="mr-2 h-4 w-4" /> New note <kbd className="ml-auto text-xs text-muted-foreground">⌘N</kbd></CommandItem>
          <CommandItem onSelect={() => go(onNewFolder)}><FolderPlus className="mr-2 h-4 w-4" /> New folder</CommandItem>
          <CommandItem onSelect={() => go(toggle)}>{theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} Toggle theme</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go(() => navigate({ to: "/dashboard" }))}><FileText className="mr-2 h-4 w-4" /> All notes</CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/dashboard", search: { view: "pinned" } as any }))}><Pin className="mr-2 h-4 w-4" /> Pinned</CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/dashboard", search: { view: "archived" } as any }))}><Archive className="mr-2 h-4 w-4" /> Archive</CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/trash" }))}><Trash2 className="mr-2 h-4 w-4" /> Trash</CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/stats" }))}><BarChart3 className="mr-2 h-4 w-4" /> Stats</CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/settings" }))}><Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
        </CommandGroup>
        {folders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Folders">
              {folders.map((f) => (
                <CommandItem key={f.id} onSelect={() => go(() => navigate({ to: "/dashboard", search: { folder: f.id } as any }))}>
                  <Folder className="mr-2 h-4 w-4" /> {f.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {results.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Notes">
              {results.map((n) => (
                <CommandItem key={n.id} onSelect={() => go(() => onOpenNote(n.id))}>
                  <Search className="mr-2 h-4 w-4" />
                  <span className="truncate">{n.title || "Untitled"}</span>
                  <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">{n.content.slice(0, 40)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => go(signOut)}><LogOut className="mr-2 h-4 w-4" /> Sign out</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
