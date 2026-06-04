import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Pull user's notes as lightweight RAG context (authed via bearer token)
        const auth = request.headers.get("authorization") ?? "";
        let notesContext = "The user has no notes yet.";
        try {
          const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!;
          const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
          if (auth && supabaseUrl && supabaseKey) {
            const sb = createClient(supabaseUrl, supabaseKey, {
              global: { headers: { Authorization: auth } },
              auth: { persistSession: false, autoRefreshToken: false },
            });
            const { data } = await sb
              .from("notes")
              .select("title,content,tags,updated_at")
              .is("deleted_at", null)
              .order("updated_at", { ascending: false })
              .limit(40);
            if (data && data.length) {
              notesContext = data
                .map((n: any, i: number) => `# Note ${i + 1}: ${n.title || "Untitled"}\nTags: ${(n.tags || []).join(", ") || "none"}\n${(n.content || "").slice(0, 1200)}`)
                .join("\n\n---\n\n");
            }
          }
        } catch (e) {
          console.error("notes context fetch failed", e);
        }

        const system = `You are Noctis AI, a brilliant personal knowledge assistant.
You have access to the user's notes below. Reference them when relevant, cite the note titles, and synthesize across notes.
If a question isn't covered by the notes, answer from general knowledge but say so.
Be concise, use Markdown, and use bullet points where helpful.

=== USER NOTES (most recent 40) ===
${notesContext}
=== END NOTES ===`;

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
      },
    },
  },
});
