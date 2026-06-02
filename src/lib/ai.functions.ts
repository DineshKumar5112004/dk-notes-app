import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  action: z.enum(["summarize", "rewrite", "expand", "fix_grammar", "generate", "title", "tags"]),
  content: z.string().min(1).max(20000),
});

type Action = z.infer<typeof inputSchema>["action"];

const SYSTEM_PROMPTS: Record<Action, string> = {
  summarize: "You are an expert note-summarizer. Produce a concise, bullet-point summary (max 6 bullets) of the user's note. Output only the summary in clean Markdown.",
  rewrite: "You are an expert editor. Rewrite the user's note to be clearer, more polished, and more professional while preserving the meaning. Output only the rewritten note in Markdown.",
  expand: "You are a writing assistant. Expand the user's brief notes into a richer, more detailed version with examples and structure. Output only the expanded note in Markdown.",
  fix_grammar: "You are a meticulous proofreader. Fix grammar, spelling, and punctuation in the user's note. Preserve their voice and Markdown formatting. Output only the corrected note.",
  generate: "You are a creative note-writer. Generate a well-structured note in Markdown based on the user's topic or prompt. Include headings, bullet points, and useful detail. Output only the note.",
  title: "Generate a single concise, descriptive title (max 8 words) for the following note. Output ONLY the title, no quotes, no punctuation at the end.",
  tags: "Suggest 3-5 lowercase, single-word tags for the following note (no # symbol, no spaces). Output ONLY a comma-separated list, nothing else.",
};

export const aiAssist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[data.action] },
          { role: "user", content: data.content },
        ],
      }),
    });

    if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please top up Lovable AI credits.");
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}): ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return { text: text.trim() };
  });
