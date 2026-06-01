import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Search, Pin, Palette, Cloud, Lock, Tag, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noctis — Notes that feel like writing on glass" },
      { name: "description", content: "Capture, tag, pin, and search your notes. Cloud-synced, secure, and stunning in dark mode." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Search, title: "Instant search", desc: "Find any thought in milliseconds across titles, content, and tags." },
  { icon: Pin, title: "Pin what matters", desc: "Float your important notes to the top of the canvas." },
  { icon: Palette, title: "Color-coded", desc: "Seven beautiful hues to organize at a glance." },
  { icon: Tag, title: "Smart tags", desc: "Tag, filter, and find related thoughts with ease." },
  { icon: Cloud, title: "Cloud sync", desc: "Your notes live securely in the cloud — access them anywhere." },
  { icon: Lock, title: "Private by default", desc: "Row-level security ensures only you can read your notes." },
  { icon: Moon, title: "Dark & light", desc: "A finely tuned theme for any time of day." },
  { icon: Sparkles, title: "Archive & restore", desc: "Tidy your workspace without losing a single idea." },
];

function Index() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Noctis</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild><Link to="/dashboard">Open dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
              <Button asChild><Link to="/login">Get started</Link></Button>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6">
        <section className="mx-auto max-w-4xl py-20 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3" /> Built for thinkers, students, and makers
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Notes that feel like<br />
            <span className="text-gradient">writing on glass.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            A modern, cloud-synced note-saving experience with tags, pins, colors, and a gorgeous dark mode — designed for your sixth-semester brilliance.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow">
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Open your notes" : "Start writing — it's free"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#features">See features</a>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Everything you need.<br />Nothing you don't.</h2>
            <p className="mt-4 text-muted-foreground">Eight thoughtfully crafted features. One delightful canvas.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20">
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-10 text-center shadow-card md:p-16">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Ready to capture your next idea?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Sign in with email or Google. Your notes will be waiting.</p>
            <Button asChild size="lg" className="mt-8 bg-gradient-primary shadow-glow">
              <Link to={user ? "/dashboard" : "/login"}>
                {user ? "Go to dashboard" : "Create your account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Noctis. A note-saver project crafted with care.
        </footer>
      </main>
    </div>
  );
}
