import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Coffee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/focus")({
  head: () => ({ meta: [{ title: "Focus — Noctis" }] }),
  component: FocusPage,
});

const FOCUS_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function FocusPage() {
  const { notes, createNote, updateNote } = useAppData();
  const active = notes.filter((n) => !n.deleted_at && !n.archived);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!noteId && active.length) setNoteId(active[0].id);
  }, [active, noteId]);

  useEffect(() => {
    const n = notes.find((x) => x.id === noteId);
    if (n) { setTitle(n.title); setContent(n.content); }
  }, [noteId]); // eslint-disable-line

  useEffect(() => {
    if (!noteId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => updateNote(noteId, { title, content } as any), 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, content, noteId]); // eslint-disable-line

  // Pomodoro
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [secs, setSecs] = useState(FOCUS_SEC);
  const [sessions, setSessions] = useState(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("noctis-pomodoros") || "0", 10) || 0;
  });

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (secs > 0) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch {}
    if (mode === "focus") {
      const next = sessions + 1;
      setSessions(next);
      localStorage.setItem("noctis-pomodoros", String(next));
      setMode("break"); setSecs(BREAK_SEC);
    } else {
      setMode("focus"); setSecs(FOCUS_SEC);
    }
  }, [secs]); // eslint-disable-line

  const total = mode === "focus" ? FOCUS_SEC : BREAK_SEC;
  const pct = ((total - secs) / total) * 100;
  const mm = String(Math.floor(Math.max(0, secs) / 60)).padStart(2, "0");
  const ss = String(Math.max(0, secs) % 60).padStart(2, "0");

  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-2">
          <select
            value={noteId ?? ""}
            onChange={(e) => setNoteId(e.target.value || null)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"
          >
            {active.length === 0 && <option value="">No notes yet</option>}
            {active.map((n) => <option key={n.id} value={n.id}>{n.title || "Untitled"}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={async () => {
            const n = await createNote({ title: "Focus session", content: "" });
            if (n) setNoteId(n.id);
          }}>
            + New
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-card md:p-10">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="mb-4 h-auto border-0 bg-transparent p-0 font-display text-3xl font-bold focus-visible:ring-0 md:text-4xl"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Just write. The world disappears here…"
            rows={20}
            className="min-h-[55vh] resize-none border-0 bg-transparent p-0 text-base leading-relaxed focus-visible:ring-0 md:text-lg"
          />
          <div className="mt-4 text-xs text-muted-foreground">{wordCount} words · auto-saved</div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-gradient-aurora/10 p-6 shadow-card">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            {mode === "focus" ? <Zap className="h-4 w-4 text-primary" /> : <Coffee className="h-4 w-4 text-primary" />}
            {mode === "focus" ? "Focus" : "Break"}
          </div>
          <div className="relative mx-auto my-2 grid h-44 w-44 place-items-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeOpacity="0.15" strokeWidth="6" fill="none" />
              <circle cx="50" cy="50" r="44" stroke="url(#g)" strokeWidth="6" fill="none"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - pct / 100)}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <div className="font-display text-4xl font-bold tabular-nums">{mm}:{ss}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{mode}</div>
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-2">
            <Button size="sm" onClick={() => setRunning((r) => !r)} className="bg-gradient-aurora shadow-glow">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setRunning(false); setSecs(mode === "focus" ? FOCUS_SEC : BREAK_SEC); }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            🍅 <span className="font-medium text-foreground">{sessions}</span> {sessions === 1 ? "pomodoro" : "pomodoros"} completed
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">Tips</div>
          <ul className="list-disc space-y-1 pl-4">
            <li>Hide the sidebar with the editor's left collapse.</li>
            <li>Cycle: 25 min focus → 5 min break.</li>
            <li>Notes save automatically as you type.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

// quiet unused var warnings in some configs
void cn;
