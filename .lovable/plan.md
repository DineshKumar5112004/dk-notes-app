# Noctis 2.0 — Next-Level Upgrade

Visual direction: **Midnight Indigo** palette, **Space Grotesk + DM Sans**, **Magazine** dashboard layout. Plus four power features so this stands apart from any classmate's build.

## 1. Design system refresh (`src/styles.css`)
- Replace tokens with Midnight Indigo: `--background #0a0a1a`, `--card #141432`, `--border #1e1e5a`, `--primary #4f46e5`, plus a soft `--primary-glow` and an aurora gradient.
- Wire Space Grotesk (display) + DM Sans (body) via Google Fonts `@import`; expose `--font-display` / `--font-sans` in `@theme`.
- Add utility tokens: `--shadow-glow`, `--gradient-aurora`, `--gradient-primary`, ring/focus styles, glass card surface.

## 2. Magazine dashboard (`src/routes/_authenticated/dashboard.tsx`)
- New top hero strip: featured pinned note (large), 2 secondary pinned notes, weekly stats chip.
- Below: editorial 12-col grid — left rail "Recently edited" list, center large note feed, right rail "Tags & quick actions".
- Keep existing filtering/search; restyle `NoteCard` with new color tokens, animated hover.

## 3. AI Chat with your notes — `/_authenticated/chat`
- New route + page using AI Elements (`Conversation`, `Message`, `MessageResponse`, `PromptInput`).
- New server fn `src/lib/ai-chat.functions.ts` using AI SDK + Lovable Gateway (`google/gemini-3-flash-preview`), streaming via `/api/chat` route.
- Context injection: server fn fetches the user's notes (title + content snippet) via authed Supabase client and prepends them as system context (lightweight RAG).
- localStorage-backed single conversation (per chat-agent contract).

## 4. Kanban board — `/_authenticated/board`
- Columns derived from folders (or status tags `todo/doing/done`).
- Drag & drop via `@dnd-kit/core` + `@dnd-kit/sortable` (install).
- Dropping a card updates `notes.folder_id` (or a `status` tag) through existing `updateNote`.

## 5. Graph view — `/_authenticated/graph`
- Force-directed graph of notes ↔ tags ↔ folders using `react-force-graph-2d` (install) on a dark canvas with indigo nodes / aurora edges.
- Click node → open that note in the editor.

## 6. Focus mode + Pomodoro — `/_authenticated/focus`
- Distraction-free editor (centered, large type, hides sidebar) for the currently selected note.
- Pomodoro timer (25/5 cycles) with start/pause/reset, session counter, ambient progress ring, subtle sound on completion.
- Session totals persisted in `localStorage`.

## 7. Sidebar + command palette
- Add nav entries for Chat, Board, Graph, Focus with lucide icons.
- Register new commands in `CommandPalette.tsx` so ⌘K can jump to each.

## 8. Polish & QA
- Update landing page hero copy to mention the four new features.
- Verify build (typecheck), check `/dashboard`, `/chat`, `/board`, `/graph`, `/focus` render with no console errors.
- Confirm RLS still scopes everything; no new tables required (reusing `notes` + `folders`).

## Technical notes
- Packages to add: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `react-force-graph-2d`, `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`.
- AI calls go through a new `src/lib/ai-gateway.server.ts` helper using `LOVABLE_API_KEY` (already provisioned).
- Streaming chat endpoint: `src/routes/api/chat.ts` (server route) — calls `streamText` and returns `toUIMessageStreamResponse`.
- No DB migrations needed; existing `notes`/`folders` schema already supports everything.
- All new routes live under `_authenticated/` so the existing route gate protects them; `useServerFn` + `attachSupabaseAuth` (already wired) handles auth.

Approve and I'll build it all in one pass.
