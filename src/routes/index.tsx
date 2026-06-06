import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Search, Pin, Palette, Cloud, Lock, Tag, Moon, Wand2, Share2, FileText, Command, Folder, BarChart3, Trash2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noctis — Pro Note-Taking with AI, Sync & Sharing" },
      { name: "description", content: "Capture brilliance with AI-powered writing, public share links, folders, tags, Markdown, dark mode, and real-time cloud sync. Built for thinkers." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Wand2, title: "AI writing assistant", desc: "Summarize, rewrite, expand, fix grammar, or generate from a prompt — instantly, in any note." },
  { icon: Share2, title: "Public share links", desc: "Publish any note as a polished, read-only page — share with one click, revoke any time." },
  { icon: Folder, title: "Folders & smart tags", desc: "Organize at scale with nested folders and multi-tag filtering built for large knowledge bases." },
  { icon: Search, title: "Instant search", desc: "Global search and a ⌘K command palette surface anything in your workspace in milliseconds." },
  { icon: FileText, title: "Markdown & templates", desc: "Live Markdown with meeting, journal, project, and reading templates to start writing faster." },
  { icon: BarChart3, title: "Productivity analytics", desc: "Track writing streaks, word counts, and tag distribution — see how your knowledge compounds." },
  { icon: Trash2, title: "Safe by default", desc: "Soft-delete with one-click restore. Nothing is ever lost until you choose to remove it." },
  { icon: Pin, title: "Pins & priorities", desc: "Surface what matters with pins, colors, and a featured workspace hero on your dashboard." },
  { icon: Palette, title: "Color-coded notes", desc: "Seven carefully tuned hues let you scan, sort, and triage your workspace at a glance." },
  { icon: Cloud, title: "Real-time sync", desc: "Postgres-backed with realtime channels — your changes appear instantly on every device." },
  { icon: Lock, title: "Private by design", desc: "Row-level security keeps every note scoped to you. Your workspace is yours alone." },
  { icon: Moon, title: "Light & dark themes", desc: "A meticulously crafted dark mode and a clean light mode — comfortable in any environment." },
];

const stats = [
  { value: "AI", label: "Built-in writing assistant" },
  { value: "⌘K", label: "Command palette" },
  { value: "Realtime", label: "Cloud sync" },
  { value: "0ms", label: "To start writing" },
];

const shortcuts = [
  { keys: "⌘ K", action: "Open command palette" },
  { keys: "⌘ N", action: "Create new note" },
  { keys: "/", action: "Focus global search" },
  { keys: "Esc", action: "Close any dialog" },
];

function Index() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 12, scale: 1.05 }} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-xl font-bold">Noctis</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#ai" className="transition hover:text-foreground">AI</a>
            <a href="#shortcuts" className="transition hover:text-foreground">Shortcuts</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild className="bg-gradient-primary"><Link to="/dashboard">Open dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
                <Button asChild className="bg-gradient-primary shadow-glow"><Link to="/login">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6">
        {/* Hero */}
        <section className="relative mx-auto max-w-5xl py-20 text-center md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> Now with AI writing assistant + public share links
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Notes that think<br />
            <span className="text-gradient">alongside you.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            A pro-grade note workspace with an AI assistant, folders, Markdown, templates, public sharing, statistics, and a command palette — all in a stunning midnight aesthetic.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow">
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Open your notes" : "Start free"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">Explore features</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                className="rounded-2xl border border-border bg-card/40 p-5 backdrop-blur">
                <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI showcase */}
        <section id="ai" className="py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Wand2 className="h-3 w-3" /> AI Assistant
              </div>
              <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">Write smarter,<br />not harder.</h2>
              <p className="mt-4 text-lg text-muted-foreground">Tap the Magic button inside any note to summarize, expand, rewrite, fix grammar, generate fresh content, or auto-suggest titles & tags. Powered by Gemini via Lovable AI — no API keys, no setup.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Summarize long notes into 6 bullet points", "Rewrite for clarity & polish", "Expand bullet points into full prose", "Fix grammar without losing your voice", "Auto-generate titles & tags"].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-primary"><Sparkles className="h-3 w-3 text-primary-foreground" /></div>
                    <span className="text-muted-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-xs text-muted-foreground">Meeting notes — Q4 planning</span>
              </div>
              <div className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
                <p className="text-foreground">## Decisions</p>
                <p>- Launch v2 mid-November</p>
                <p>- Hire 2 frontend engineers</p>
                <p>- Migrate auth to Lovable Cloud</p>
              </div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-6 rounded-xl border border-primary/30 bg-gradient-primary/10 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Wand2 className="h-3.5 w-3.5" /> AI Summary
                </div>
                <p className="mt-2 text-sm">Three Q4 decisions: v2 mid-November launch, two frontend hires, and auth migration to Lovable Cloud.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="py-20">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Twelve features.<br />One delightful canvas.</h2>
            <p className="mt-4 text-muted-foreground">Every detail tuned to make your sixth-semester project unforgettable.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.03 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Shortcuts */}
        <section id="shortcuts" className="py-20">
          <div className="rounded-3xl border border-border bg-card p-10 shadow-card md:p-16">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                  <Keyboard className="h-3 w-3" /> Power-user ready
                </div>
                <h2 className="mt-4 font-display text-4xl font-bold">Keyboard-first<br />by design.</h2>
                <p className="mt-4 text-muted-foreground">Every action has a shortcut. Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">⌘ K</kbd> anywhere to summon the command palette.</p>
              </div>
              <div className="space-y-3">
                {shortcuts.map((s) => (
                  <div key={s.action} className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3">
                    <span className="text-sm">{s.action}</span>
                    <kbd className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-primary p-10 text-center text-primary-foreground shadow-glow md:p-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative">
              <Command className="mx-auto mb-4 h-10 w-10 opacity-90" />
              <h2 className="font-display text-3xl font-bold md:text-5xl">Ready to capture your next idea?</h2>
              <p className="mx-auto mt-4 max-w-xl opacity-90">Sign in with email or Google. Your AI-powered workspace is one click away.</p>
              <Button asChild size="lg" variant="secondary" className="mt-8 shadow-lg">
                <Link to={user ? "/dashboard" : "/login"}>
                  {user ? "Go to dashboard" : "Create your account"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" />
            <span>© {new Date().getFullYear()} Noctis. A pro-grade note workspace.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
