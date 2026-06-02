import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, ArrowLeft, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const Route = createFileRoute("/share/$token")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("notes")
      .select("title, content, tags, created_at, updated_at, word_count, color")
      .eq("share_token", params.token)
      .eq("is_public", true)
      .is("deleted_at", null)
      .maybeSingle();
    if (error || !data) throw notFound();
    return { note: data };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.note?.title || "Shared note"} — Noctis` },
      { name: "description", content: (loaderData?.note?.content || "").slice(0, 160) },
      { property: "og:title", content: loaderData?.note?.title || "Shared note" },
    ],
  }),
  component: SharedNote,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center bg-gradient-hero p-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Note unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button asChild className="mt-6 bg-gradient-primary"><Link to="/">Go home</Link></Button>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-gradient-hero p-6 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold">This note isn't shared</h1>
        <p className="mt-2 text-sm text-muted-foreground">The link may have expired or the owner disabled sharing.</p>
        <Button asChild className="mt-6 bg-gradient-primary"><Link to="/">Go to Noctis</Link></Button>
      </div>
    </div>
  ),
});

function SharedNote() {
  const { note } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-background/60 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Noctis</span>
          </Link>
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link></Button>
        </div>
      </header>

      <article className="container mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3" /> Shared via Noctis · read-only
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">{note.title || "Untitled"}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(note.updated_at), "PPP")}</span>
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {note.word_count} words</span>
          {note.tags?.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {note.tags.map((t: string) => <span key={t} className="rounded-full bg-muted px-2 py-0.5">#{t}</span>)}
            </span>
          )}
        </div>
        <div className="prose-notes mt-10 rounded-2xl border border-border bg-card/40 p-8 shadow-card backdrop-blur">
          {note.content?.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">This note is empty.</p>
          )}
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-gradient-primary/10 p-8 text-center">
          <h3 className="font-display text-xl font-semibold">Like what you see?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your own beautiful notes with Noctis.</p>
          <Button asChild className="mt-4 bg-gradient-primary shadow-glow"><Link to="/login">Start free</Link></Button>
        </div>
      </article>
    </div>
  );
}
