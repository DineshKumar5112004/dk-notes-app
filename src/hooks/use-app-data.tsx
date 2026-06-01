import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export type NoteColor = "default" | "indigo" | "violet" | "rose" | "amber" | "emerald" | "sky";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  tags: string[];
  folder_id: string | null;
  deleted_at: string | null;
  reminder_at: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_emoji: string;
}

interface AppData {
  notes: Note[];
  folders: Folder[];
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  // notes
  createNote: (input: Partial<Note>) => Promise<Note | null>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  destroyNote: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  // folders
  createFolder: (name: string, color?: string) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  // profile
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const Ctx = createContext<AppData | null>(null);

function wc(s: string) { return s.trim() ? s.trim().split(/\s+/).length : 0; }

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [n, f, p] = await Promise.all([
      supabase.from("notes").select("*").order("pinned", { ascending: false }).order("updated_at", { ascending: false }),
      supabase.from("folders").select("*").order("created_at", { ascending: true }),
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    if (!n.error) setNotes((n.data as Note[]) ?? []);
    if (!f.error) setFolders((f.data as Folder[]) ?? []);
    if (!p.error) setProfile((p.data as Profile) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  // Realtime sync
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("app-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${user.id}` }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "folders", filter: `user_id=eq.${user.id}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, refresh]);

  const createNote: AppData["createNote"] = async (input) => {
    if (!user) return null;
    const payload: any = {
      user_id: user.id,
      title: input.title ?? "",
      content: input.content ?? "",
      color: input.color ?? "default",
      pinned: input.pinned ?? false,
      archived: false,
      tags: input.tags ?? [],
      folder_id: input.folder_id ?? null,
      reminder_at: input.reminder_at ?? null,
      word_count: wc(input.content ?? ""),
    };
    const { data, error } = await supabase.from("notes").insert(payload).select().single();
    if (error) { toast.error(error.message); return null; }
    setNotes((prev) => [data as Note, ...prev]);
    return data as Note;
  };

  const updateNote: AppData["updateNote"] = async (id, patch) => {
    const update: any = { ...patch };
    if (patch.content !== undefined) update.word_count = wc(patch.content);
    const { error } = await supabase.from("notes").update(update).eq("id", id);
    if (error) return void toast.error(error.message);
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...update } as Note : n)));
  };

  const trashNote: AppData["trashNote"] = async (id) => {
    await updateNote(id, { deleted_at: new Date().toISOString() } as any);
    toast.success("Moved to trash", { action: { label: "Undo", onClick: () => updateNote(id, { deleted_at: null } as any) } });
  };
  const restoreNote: AppData["restoreNote"] = async (id) => {
    await updateNote(id, { deleted_at: null } as any);
    toast.success("Restored");
  };
  const destroyNote: AppData["destroyNote"] = async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    setNotes((p) => p.filter((n) => n.id !== id));
    toast.success("Deleted forever");
  };
  const emptyTrash: AppData["emptyTrash"] = async () => {
    const ids = notes.filter((n) => n.deleted_at).map((n) => n.id);
    if (!ids.length) return;
    const { error } = await supabase.from("notes").delete().in("id", ids);
    if (error) return void toast.error(error.message);
    setNotes((p) => p.filter((n) => !ids.includes(n.id)));
    toast.success(`Deleted ${ids.length} notes`);
  };

  const createFolder: AppData["createFolder"] = async (name, color = "indigo") => {
    if (!user) return null;
    const { data, error } = await supabase.from("folders").insert({ user_id: user.id, name, color }).select().single();
    if (error) { toast.error(error.message); return null; }
    setFolders((p) => [...p, data as Folder]);
    toast.success("Folder created");
    return data as Folder;
  };
  const renameFolder: AppData["renameFolder"] = async (id, name) => {
    const { error } = await supabase.from("folders").update({ name }).eq("id", id);
    if (error) return void toast.error(error.message);
    setFolders((p) => p.map((f) => (f.id === id ? { ...f, name } : f)));
  };
  const deleteFolder: AppData["deleteFolder"] = async (id) => {
    const { error } = await supabase.from("folders").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    setFolders((p) => p.filter((f) => f.id !== id));
    toast.success("Folder deleted");
  };

  const updateProfile: AppData["updateProfile"] = async (patch) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) return void toast.error(error.message);
    setProfile(data as Profile);
    toast.success("Profile updated");
  };

  const value = useMemo<AppData>(() => ({
    notes, folders, profile, loading, refresh,
    createNote, updateNote, trashNote, restoreNote, destroyNote, emptyTrash,
    createFolder, renameFolder, deleteFolder, updateProfile,
  }), [notes, folders, profile, loading, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppData must be used within AppDataProvider");
  return v;
}
