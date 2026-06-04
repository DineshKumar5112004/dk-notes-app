import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Bot, User as UserIcon, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Chat with your notes — Noctis" }] }),
  component: ChatPage,
});

const STORAGE_KEY = "noctis-chat-v1";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function ChatPage() {
  const initial = useMemo(loadMessages, []);
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    fetch: async (url, init) => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = new Headers(init?.headers);
      if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
      return fetch(url, { ...init, headers });
    },
  }), []);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "noctis-chat",
    messages: initial,
    transport,
    onError: (e) => console.error("chat error", e),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const busy = status === "submitted" || status === "streaming";

  const submit = async () => {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const suggestions = [
    "Summarize all my notes from this week",
    "What are the action items across my notes?",
    "Find ideas related to AI",
    "Draft a study plan based on my notes",
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Chat with your notes</h1>
          <p className="text-sm text-muted-foreground">Ask anything. Noctis AI reads your notes and answers with context.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY); }}>
            <Trash2 className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-3xl border border-border bg-card/40 p-4 md:p-6 shadow-card">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div className="max-w-lg">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-aurora shadow-glow">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">What's on your mind?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your notes are loaded. Try one of these:</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => { setInput(s); setTimeout(submit, 0); }}
                    className="rounded-xl border border-border bg-card/60 p-3 text-left text-sm transition hover:border-primary/50 hover:bg-card hover:shadow-glow">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => {
              const text = m.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={"flex gap-3 " + (isUser ? "flex-row-reverse" : "")}>
                  <div className={"mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg " + (isUser ? "bg-primary text-primary-foreground" : "bg-gradient-aurora text-primary-foreground shadow-glow")}>
                    {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={"max-w-[85%] " + (isUser ? "rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground" : "text-foreground")}>
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-headings:mt-3 prose-headings:mb-2 prose-pre:bg-muted/50 prose-code:text-primary">
                      <ReactMarkdown>{text || (busy ? "…" : "")}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end gap-2 rounded-2xl border border-border bg-card/60 p-2 shadow-card">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Ask anything about your notes…  (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="min-h-[52px] resize-none border-0 bg-transparent focus-visible:ring-0"
          disabled={busy}
        />
        <Button onClick={submit} disabled={busy || !input.trim()} className="bg-gradient-aurora shadow-glow">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
