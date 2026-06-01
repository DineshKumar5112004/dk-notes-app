import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Pin, Archive, Trash2, BookText, Hash, Folder } from "lucide-react";
import { useAppData } from "@/hooks/use-app-data";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({ meta: [{ title: "Statistics — Noctis" }] }),
  component: Stats,
});

const COLORS = ["#7c5cff", "#b56cff", "#ff6c9d", "#ffb06c", "#6cffb0", "#6cb5ff", "#cccccc"];

function Stats() {
  const { notes, folders } = useAppData();
  const active = notes.filter((n) => !n.deleted_at);

  const totals = useMemo(() => ({
    notes: active.length,
    pinned: active.filter((n) => n.pinned).length,
    archived: active.filter((n) => n.archived).length,
    trash: notes.filter((n) => n.deleted_at).length,
    words: active.reduce((s, n) => s + (n.word_count || 0), 0),
    tags: new Set(active.flatMap((n) => n.tags)).size,
  }), [notes, active]);

  const last30 = useMemo(() => {
    const days: { date: string; notes: number; words: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const dayNotes = active.filter((n) => {
        const c = new Date(n.created_at); return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth() && c.getDate() === d.getDate();
      });
      days.push({ date: label, notes: dayNotes.length, words: dayNotes.reduce((s, n) => s + n.word_count, 0) });
    }
    return days;
  }, [active]);

  const colorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((n) => { map[n.color] = (map[n.color] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [active]);

  const topTags = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((n) => n.tags.forEach((t) => { map[t] = (map[t] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({ tag: `#${tag}`, count }));
  }, [active]);

  const folderBreakdown = useMemo(() => {
    return folders.map((f) => ({ name: f.name, notes: active.filter((n) => n.folder_id === f.id).length }));
  }, [folders, active]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Statistics</h1>
        <p className="text-sm text-muted-foreground">A bird's-eye view of your second brain.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat icon={FileText} label="Notes" value={totals.notes} />
        <Stat icon={BookText} label="Words" value={totals.words.toLocaleString()} />
        <Stat icon={Pin} label="Pinned" value={totals.pinned} />
        <Stat icon={Archive} label="Archived" value={totals.archived} />
        <Stat icon={Hash} label="Tags" value={totals.tags} />
        <Stat icon={Trash2} label="In trash" value={totals.trash} />
      </div>

      <Card className="p-5">
        <h3 className="mb-1 font-display font-semibold">Last 30 days</h3>
        <p className="mb-4 text-xs text-muted-foreground">Notes created per day</p>
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <AreaChart data={last30}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="notes" stroke="#7c5cff" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-display font-semibold">Color palette</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={colorBreakdown} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {colorBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display font-semibold">Top tags</h3>
          <div className="h-56">
            {topTags.length === 0 ? <p className="text-sm text-muted-foreground">No tags yet.</p> : (
              <ResponsiveContainer>
                <BarChart data={topTags} layout="vertical">
                  <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis dataKey="tag" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                  <Bar dataKey="count" fill="#b56cff" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {folderBreakdown.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display font-semibold"><Folder className="h-4 w-4" /> Folders</h3>
          <div className="space-y-2">
            {folderBreakdown.map((f) => {
              const max = Math.max(...folderBreakdown.map((x) => x.notes), 1);
              return (
                <div key={f.name}>
                  <div className="mb-1 flex justify-between text-xs"><span>{f.name}</span><span className="text-muted-foreground">{f.notes}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(f.notes / max) * 100}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-primary" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border bg-card/50 p-4 shadow-card">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}
