import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Download, Keyboard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Noctis" }] }),
  component: Settings,
});

const EMOJIS = ["✨","🌙","📝","💡","🚀","🎨","🧠","☕","🔥","🌊","🍀","⭐"];

function Settings() {
  const { user } = useAuth();
  const { profile, updateProfile, notes } = useAppData();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [emoji, setEmoji] = useState("✨");

  useEffect(() => {
    setName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
    setEmoji(profile?.avatar_emoji ?? "✨");
  }, [profile]);

  const save = () => updateProfile({ display_name: name, bio, avatar_emoji: emoji });

  const exportAll = () => {
    const data = notes.filter((n) => !n.deleted_at).map((n) => ({
      title: n.title, content: n.content, tags: n.tags, color: n.color, pinned: n.pinned, archived: n.archived, created_at: n.created_at,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `noctis-export-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} notes`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Personalize your workspace.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <p className="mb-5 text-xs text-muted-foreground">Visible to you only.</p>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Avatar</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)} className={`grid h-10 w-10 place-items-center rounded-xl border text-xl transition ${emoji === e ? "border-primary bg-gradient-primary shadow-glow" : "border-border hover:border-primary/50"}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs" htmlFor="dn">Display name</Label>
            <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <Label className="text-xs" htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short note about you…" rows={3} />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-xs text-muted-foreground">Signed in as {user?.email}</span>
            <Button size="sm" onClick={save} className="bg-gradient-primary">Save</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">{theme === "dark" ? "Dark mode active" : "Light mode active"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={toggle}>{theme === "dark" ? <><Sun className="mr-1 h-4 w-4" /> Light</> : <><Moon className="mr-1 h-4 w-4" /> Dark</>}</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Data</h2>
        <p className="text-xs text-muted-foreground">Export your entire workspace as JSON.</p>
        <Button variant="outline" size="sm" onClick={exportAll} className="mt-3"><Download className="mr-1 h-4 w-4" /> Export all notes</Button>
      </Card>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><Keyboard className="h-4 w-4" /> Keyboard shortcuts</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Shortcut keys="⌘ K" label="Command palette" />
          <Shortcut keys="⌘ N" label="New note" />
          <Shortcut keys="/" label="Focus search" />
          <Shortcut keys="Esc" label="Close dialog" />
        </div>
      </Card>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono">{keys}</kbd>
    </div>
  );
}
