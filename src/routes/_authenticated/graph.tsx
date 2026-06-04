import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useRef, useState, useEffect } from "react";
import { useAppData } from "@/hooks/use-app-data";
import { Loader2 } from "lucide-react";

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));

export const Route = createFileRoute("/_authenticated/graph")({
  head: () => ({ meta: [{ title: "Graph — Noctis" }] }),
  component: GraphPage,
});

function GraphPage() {
  const { notes } = useAppData();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = wrapRef.current!.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const data = useMemo(() => {
    const active = notes.filter((n) => !n.deleted_at && !n.archived);
    const nodes: any[] = [];
    const links: any[] = [];
    const tagSet = new Set<string>();
    active.forEach((n) => {
      nodes.push({ id: n.id, name: n.title || "Untitled", group: "note", val: 4 + Math.min(8, n.word_count / 40) });
      n.tags.forEach((t) => tagSet.add(t));
    });
    Array.from(tagSet).forEach((t) => nodes.push({ id: `tag:${t}`, name: `#${t}`, group: "tag", val: 6 }));
    active.forEach((n) => n.tags.forEach((t) => links.push({ source: n.id, target: `tag:${t}` })));
    return { nodes, links };
  }, [notes]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Knowledge graph</h1>
        <p className="text-sm text-muted-foreground">Your notes and tags as a living network. Click a node to open it.</p>
      </div>
      <div ref={wrapRef} className="bg-grid relative h-[70vh] overflow-hidden rounded-3xl border border-border bg-card/40 shadow-card">
        {mounted ? (
          <Suspense fallback={<Fallback />}>
            <ForceGraph2D
              graphData={data}
              width={size.w}
              height={size.h}
              backgroundColor="rgba(0,0,0,0)"
              nodeRelSize={5}
              linkColor={() => "rgba(120,120,200,0.25)"}
              nodeCanvasObject={(node: any, ctx, scale) => {
                const isTag = node.group === "tag";
                const r = (node.val ?? 5) / 1.2;
                ctx.beginPath();
                ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                ctx.fillStyle = isTag ? "#a78bfa" : "#4f46e5";
                ctx.shadowColor = isTag ? "rgba(167,139,250,0.6)" : "rgba(79,70,229,0.7)";
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
                if (scale > 1.2) {
                  ctx.font = `${10 / scale}px "DM Sans", sans-serif`;
                  ctx.fillStyle = "rgba(230,230,255,0.9)";
                  ctx.textAlign = "center";
                  ctx.fillText(String(node.name).slice(0, 24), node.x, node.y + r + 8 / scale);
                }
              }}
              onNodeClick={(node: any) => {
                if (node.group === "note") window.dispatchEvent(new CustomEvent("noctis:openEditor", { detail: node.id }));
              }}
              cooldownTicks={120}
            />
          </Suspense>
        ) : <Fallback />}
        {data.nodes.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Create some notes (with tags) to see your graph come alive.
          </div>
        )}
      </div>
    </div>
  );
}

function Fallback() {
  return <div className="grid h-full place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
}
