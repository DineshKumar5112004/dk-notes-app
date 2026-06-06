import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Command, Sparkles, Network, Kanban, Timer, FileDown, Bot, Search, Lightbulb, FolderTree, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noctis — The thinking surface for connected knowledge" },
      { name: "description", content: "A futuristic workspace for notes, knowledge graphs, focus sessions, and AI co-thinking. Built for people who think for a living." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient layers */}
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute inset-0 noise mix-blend-overlay" />

      <Header user={user} />
      <Hero user={user} />
      <KnowledgeNetwork />
      <ProductivityHub />
      <AIShowcase />
      <WorkflowTimeline />
      <ClosingCTA user={user} />
      <Footer />
    </div>
  );
}

/* ─────────────── Header ─────────────── */
function Header({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  return (
    <header className="relative z-40 border-b border-border/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center rounded-lg border border-border/80 bg-card">
            <div className="absolute inset-1 rounded-md bg-mint opacity-90" />
            <div className="absolute inset-2 rounded-sm bg-background" />
            <div className="absolute h-1 w-1 rounded-full bg-mint shadow-glow" />
          </div>
          <span className="font-display text-2xl tracking-tight">Noctis</span>
          <span className="ml-1 hidden rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline">v2.0</span>
        </Link>

        <nav className="hidden items-center gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground md:flex">
          <a href="#network" className="transition hover:text-foreground">Network</a>
          <a href="#hub" className="transition hover:text-foreground">Hub</a>
          <a href="#ai" className="transition hover:text-foreground">AI</a>
          <a href="#flow" className="transition hover:text-foreground">Flow</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild variant="default" className="rounded-full">
              <Link to="/dashboard">Workspace <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full"><Link to="/login">Sign in</Link></Button>
              <Button asChild className="rounded-full bg-mint text-primary-foreground hover:bg-mint/90">
                <Link to="/login">Start writing <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─────────────── Hero ─────────────── */
function Hero({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const cards = [
    { t: "Q1 product strategy", tag: "strategy", x: "-22%", y: "8%", rot: -6, delay: 0 },
    { t: "Reading: Thinking in Systems", tag: "books", x: "85%", y: "4%", rot: 5, delay: 0.15 },
    { t: "Daily — Mar 12", tag: "journal", x: "-18%", y: "62%", rot: 4, delay: 0.3 },
    { t: "API rewrite — graph engine", tag: "engineering", x: "82%", y: "58%", rot: -5, delay: 0.45 },
  ];
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-32 md:pt-28 md:pb-40">
        {/* Floating cards */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotate: c.rot * 1.5 }}
              animate={{ opacity: 1, y: [0, -12, 0], rotate: c.rot }}
              transition={{
                opacity: { duration: 0.8, delay: c.delay },
                y: { duration: 6, delay: c.delay, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 0.8, delay: c.delay },
              }}
              className="absolute w-[260px]"
              style={{ left: c.x, top: c.y }}
            >
              <div className="glass rounded-xl border border-border/60 p-4 shadow-soft">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-mint" />
                  {c.tag}
                </div>
                <div className="mt-2 font-display text-lg leading-tight">{c.t}</div>
                <div className="mt-3 h-1 w-1/2 rounded bg-muted" />
                <div className="mt-1.5 h-1 w-3/4 rounded bg-muted" />
                <div className="mt-1.5 h-1 w-1/3 rounded bg-muted" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
            </span>
            New — knowledge graph engine live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-8 font-display text-[3.25rem] leading-[0.95] tracking-tight md:text-[6.5rem]"
          >
            A thinking surface<br />
            <span className="italic text-mint">for connected</span><br />
            knowledge.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-8 max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Notes that link themselves. A graph that maps how you think. AI that co-writes beside you. Built for the people who turn ideas into things.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="group rounded-full bg-mint px-6 text-primary-foreground hover:bg-mint/90">
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Open workspace" : "Enter your workspace"}
                <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-border/80">
              <a href="#network">See it in motion</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mt-12 flex max-w-md items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground"
          >
            <kbd className="rounded border border-border bg-card/50 px-2 py-1">⌘</kbd>
            <kbd className="rounded border border-border bg-card/50 px-2 py-1">K</kbd>
            <span>to summon the command palette · ⌘N for a new note</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Knowledge Network ─────────────── */
function KnowledgeNetwork() {
  const nodes = [
    { id: "core",  x: 50, y: 50, label: "Q1 strategy", size: 22, color: "mint"  },
    { id: "a",     x: 20, y: 25, label: "Market notes", size: 14, color: "fg" },
    { id: "b",     x: 78, y: 22, label: "Customer calls", size: 14, color: "fg" },
    { id: "c",     x: 15, y: 75, label: "Pricing model", size: 14, color: "amber" },
    { id: "d",     x: 80, y: 78, label: "Launch plan", size: 14, color: "fg" },
    { id: "e",     x: 50, y: 12, label: "Vision doc", size: 12, color: "fg" },
    { id: "f",     x: 50, y: 88, label: "Retro", size: 12, color: "fg" },
  ];
  const edges: [string,string][] = [
    ["core","a"],["core","b"],["core","c"],["core","d"],["core","e"],["core","f"],
    ["a","b"],["c","d"],["a","e"],["b","e"],["c","f"],["d","f"],
  ];
  const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
  const colorOf = (c: string) => c === "mint" ? "var(--mint)" : c === "amber" ? "var(--amber)" : "var(--foreground)";

  return (
    <section id="network" className="relative z-10 border-t border-border/40 bg-background/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint">01 — Knowledge network</div>
            <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
              Every note becomes<br />
              <span className="italic text-mint">a synapse.</span>
            </h2>
            <p className="mt-6 max-w-lg text-muted-foreground">
              Bidirectional links and tags weave your notes into a living graph. Hover any node to see what it knows. Pan, zoom, and discover the shape of your own thinking.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 font-mono text-xs">
              {[{n:"248", l:"nodes"},{n:"612", l:"edges"},{n:"34", l:"clusters"}].map(s => (
                <div key={s.l} className="rounded-xl border border-border/60 bg-card/40 p-4">
                  <div className="font-display text-3xl text-foreground">{s.n}</div>
                  <div className="mt-1 uppercase tracking-widest text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-2 shadow-soft">
            <div className="absolute inset-0 grid-bg opacity-50" />
            <svg viewBox="0 0 100 100" className="relative h-full w-full">
              {edges.map(([a,b],i) => {
                const A = pos[a], B = pos[b];
                return (
                  <motion.line
                    key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                    stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.2"
                    className="text-foreground"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i*0.05 }}
                  />
                );
              })}
              {nodes.map((n,i) => (
                <g key={n.id}>
                  <motion.circle
                    cx={n.x} cy={n.y} r={n.size/8}
                    fill={colorOf(n.color)}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i*0.08 }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  />
                  {n.color === "mint" && (
                    <circle cx={n.x} cy={n.y} r={n.size/8 + 1.2} fill="none" stroke={colorOf("mint")} strokeOpacity="0.3" strokeWidth="0.15">
                      <animate attributeName="r" values={`${n.size/8};${n.size/8 + 3};${n.size/8}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              ))}
            </svg>
            {nodes.map(n => (
              <div key={n.id}
                className="pointer-events-none absolute -translate-x-1/2 translate-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                {n.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Productivity Hub ─────────────── */
function ProductivityHub() {
  const tiles = [
    { icon: Kanban, name: "Kanban board", code: "BOARD", desc: "Drag notes across Backlog → Doing → Done. Plan a week in seconds.", className: "lg:col-span-2 lg:row-span-2" },
    { icon: Timer, name: "Focus mode", code: "FOCUS", desc: "Pomodoro timer with ambient soundscapes. Zero distractions." },
    { icon: Bot, name: "AI assistant", code: "AI", desc: "Summarize, rewrite, expand. In any note, instantly." },
    { icon: FileDown, name: "PDF export", code: "EXPORT", desc: "Ship a polished PDF from any note in one click." },
    { icon: FolderTree, name: "Folders & tags", code: "ORG", desc: "Nested folders, smart tags, scoped search." },
  ];
  return (
    <section id="hub" className="relative z-10 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">02 — Productivity hub</div>
            <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
              Every tool you reach for.<br />
              <span className="italic text-amber">One shortcut away.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px]">
          {tiles.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i*0.05 }}
              className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition hover:border-mint/40 hover:bg-card/60 ${t.className ?? ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-background/60">
                  <t.icon className="h-5 w-5 text-mint" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.code}</span>
              </div>
              <div className="mt-6">
                <div className="font-display text-2xl">{t.name}</div>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <div className="pointer-events-none absolute -bottom-px -right-px h-24 w-24 rounded-tl-3xl border-l border-t border-border/60 bg-gradient-to-tl from-mint/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── AI Showcase ─────────────── */
function AIShowcase() {
  const features = [
    { icon: Bot, title: "Chat with your notes", desc: "Ask anything. Noctis pulls answers grounded in your own writing." },
    { icon: Sparkles, title: "Instant summaries", desc: "Crush a 2000-word note into six bullets — without losing nuance." },
    { icon: Lightbulb, title: "Smart discovery", desc: "Surface forgotten notes that connect to whatever you're writing now." },
    { icon: Search, title: "Intelligent search", desc: "Search by meaning, not just keywords. Find what you meant, not what you typed." },
  ];
  return (
    <section id="ai" className="relative z-10 border-t border-border/40 bg-background/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-coral">03 — AI co-thinking</div>
            <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
              An assistant that has<br />
              <span className="italic text-mint">read everything</span><br />
              you've ever written.
            </h2>
            <p className="mt-6 max-w-xl text-muted-foreground">
              Powered by Gemini through Lovable AI. No API keys. No setup. Just a thinking partner who actually remembers.
            </p>

            <div className="mt-10 space-y-3">
              {features.map((f,i) => (
                <motion.div key={f.title}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i*0.06 }}
                  className="flex items-start gap-4 rounded-xl border border-border/60 bg-card/30 p-4 transition hover:border-mint/40"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint/10">
                    <f.icon className="h-4 w-4 text-mint" />
                  </div>
                  <div>
                    <div className="font-display text-lg">{f.title}</div>
                    <div className="text-sm text-muted-foreground">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mock chat */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-coral" />
                <div className="h-1.5 w-1.5 rounded-full bg-amber" />
                <div className="h-1.5 w-1.5 rounded-full bg-mint" />
                <span className="ml-2">noctis · ai</span>
              </div>
              <span>gemini-2.5</span>
            </div>
            <div className="space-y-4 p-6">
              <Bubble who="you" text="What did I decide about Q1 pricing?" />
              <Bubble who="ai" text="Across three notes from Feb 8–14, you landed on: tiered freemium → $12/mo Pro, $29/mo Team. Annual at 20% off. You flagged a concern about Team seat economics — see Pricing model, line 42." />
              <Bubble who="you" text="Summarize my last 5 customer calls." />
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mint" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mint" style={{ animationDelay: "0.15s" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mint" style={{ animationDelay: "0.3s" }} />
                </div>
                Reading 5 notes…
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bubble({ who, text }: { who: "you" | "ai"; text: string }) {
  const isAI = who === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isAI ? "border border-mint/30 bg-mint/5 text-foreground" : "bg-foreground/95 text-background"}`}>
        {isAI && <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mint">Noctis</div>}
        {text}
      </div>
    </div>
  );
}

/* ─────────────── Workflow Timeline ─────────────── */
function WorkflowTimeline() {
  const steps = [
    { n: "01", icon: Lightbulb, title: "Capture ideas", desc: "Hit ⌘N anywhere. Sketch a half-thought before it evaporates." },
    { n: "02", icon: Network, title: "Organize knowledge", desc: "Folders, tags, links. Let the structure emerge as you write." },
    { n: "03", icon: Timer, title: "Focus deeply", desc: "Pomodoro sessions, ambient sound, kanban for the week." },
    { n: "04", icon: Download, title: "Export & share", desc: "Polished PDFs. Public share links. Revoke any time." },
  ];
  return (
    <section id="flow" className="relative z-10 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint">04 — The flow</div>
          <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
            From spark to <span className="italic text-amber">shipped artifact.</span>
          </h2>
        </div>

        <div className="relative grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-4">
          {steps.map((s,i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i*0.08 }}
              className="relative bg-background p-8 transition hover:bg-card/50"
            >
              <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
              <div className="mt-6 grid h-10 w-10 place-items-center rounded-lg border border-border bg-card/60">
                <s.icon className="h-5 w-5 text-mint" />
              </div>
              <div className="mt-6 font-display text-2xl">{s.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Closing CTA ─────────────── */
function ClosingCTA({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  return (
    <section className="relative z-10 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-12 text-center md:p-20">
          <div className="absolute inset-0 bg-aurora opacity-60" />
          <div className="relative">
            <Command className="mx-auto h-8 w-8 text-mint" />
            <h2 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
              Your next great idea<br />
              <span className="italic text-mint">is already here.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-muted-foreground">
              Sign in with email or Google. Your workspace is one keystroke away.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-mint text-primary-foreground hover:bg-mint/90">
                <Link to={user ? "/dashboard" : "/login"}>
                  {user ? "Open workspace" : "Begin"}
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-border/80">
                <a href="#network">Explore the surface</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Footer ─────────────── */
function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-mint" />
          NOCTIS · A THINKING SURFACE · © {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <a href="#network" className="hover:text-foreground">Network</a>
          <a href="#hub" className="hover:text-foreground">Hub</a>
          <a href="#ai" className="hover:text-foreground">AI</a>
          <Link to="/login" className="hover:text-foreground">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
