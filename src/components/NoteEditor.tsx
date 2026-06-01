import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Bell, Download, FileText, Sparkles, ChevronDown, Eye, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useAppData, type Note, type NoteColor } from "@/hooks/use-app-data";
import { formatDistanceToNow } from "date-fns";

interface Props {
  open: boolean;
  note: Note | null;
  defaultFolderId?: string | null;
  onClose: () => void;
}

const colorOptions: { key: NoteColor; label: string; swatch: string }[] = [
  { key: "default", label: "Default", swatch: "bg-note-default" },
  { key: "indigo", label: "Indigo", swatch: "bg-note-indigo" },
  { key: "violet", label: "Violet", swatch: "bg-note-violet" },
  { key: "rose", label: "Rose", swatch: "bg-note-rose" },
  { key: "amber", label: "Amber", swatch: "bg-note-amber" },
  { key: "emerald", label: "Emerald", swatch: "bg-note-emerald" },
  { key: "sky", label: "Sky", swatch: "bg-note-sky" },
];

const templates: { name: string; title: string; content: string }[] = [
  { name: "Meeting notes", title: "Meeting — " + new Date().toLocaleDateString(), content: "## Attendees\n- \n\n## Agenda\n1. \n\n## Decisions\n- \n\n## Action items\n- [ ] " },
  { name: "Daily journal", title: "Journal — " + new Date().toLocaleDateString(), content: "### How I'm feeling\n\n\n### Today's wins\n- \n\n### Tomorrow's focus\n- " },
  { name: "Project plan", title: "Project: ", content: "## Goal\n\n## Scope\n- \n\n## Milestones\n- [ ] \n\n## Risks\n- " },
  { name: "Reading notes", title: "Notes on: ", content: "## Summary\n\n## Key quotes\n> \n\n## Takeaways\n- " },
];

function downloadFile(name: string, content: string, type = "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function NoteEditor({ open, note, defaultFolderId = null, onClose }: Props) {
  const { folders, createNote, updateNote } = useAppData();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [reminderAt, setReminderAt] = useState<string>("");
  const [mode, setMode] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (!open) return;
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setColor(note?.color ?? "default");
    setTags(note?.tags ?? []);
    setFolderId(note?.folder_id ?? defaultFolderId);
    setReminderAt(note?.reminder_at ? note.reminder_at.slice(0, 16) : "");
    setTagInput("");
    setMode("write");
  }, [open, note, defaultFolderId]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);
  const readMin = Math.max(1, Math.round(wordCount / 200));

  const applyTemplate = (i: number) => {
    const t = templates[i];
    setTitle((cur) => cur || t.title);
    setContent((cur) => cur ? cur + "\n\n" + t.content : t.content);
  };

  const submit = async () => {
    const payload = {
      title: title.trim(),
      content,
      color,
      tags,
      folder_id: folderId,
      reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
    };
    if (!payload.title && !payload.content.trim()) return;
    if (note) await updateNote(note.id, payload as any);
    else await createNote(payload as any);
    onClose();
  };

  const handleExport = () => {
    const fm = `---\ntitle: ${title || "Untitled"}\ntags: [${tags.join(", ")}]\ndate: ${new Date().toISOString()}\n---\n\n`;
    downloadFile(`${(title || "untitled").replace(/[^a-z0-9-]/gi, "-").toLowerCase()}.md`, fm + content);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-3 p-0">
        <DialogHeader className="border-b px-6 pt-5 pb-3">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="font-display text-base">{note ? "Edit note" : "New note"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Select value={folderId ?? "none"} onValueChange={(v) => setFolderId(v === "none" ? null : v)}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="No folder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8"><Sparkles className="mr-1 h-3.5 w-3.5" /> Template <ChevronDown className="ml-1 h-3 w-3" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {templates.map((t, i) => <DropdownMenuItem key={t.name} onClick={() => applyTemplate(i)}><FileText className="mr-2 h-4 w-4" /> {t.name}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-y-auto px-6 pb-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 px-0 font-display text-2xl font-semibold shadow-none focus-visible:ring-0"
          />

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="write" className="h-6 px-3 text-xs"><Pencil className="mr-1 h-3 w-3" /> Write</TabsTrigger>
              <TabsTrigger value="preview" className="h-6 px-3 text-xs"><Eye className="mr-1 h-3 w-3" /> Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write" className="mt-2">
              <Textarea
                placeholder="Start writing… Markdown supported (# headings, **bold**, - lists, [ ] tasks)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none border-0 px-0 font-mono text-sm shadow-none focus-visible:ring-0"
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div className="prose-notes min-h-[300px] rounded-xl border border-border bg-card/40 p-4">
                {content.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">
                #{t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
              onBlur={addTag}
              placeholder="Add tag…"
              className="h-7 w-28 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 border-t bg-muted/30 px-4 py-3 sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {colorOptions.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className={cn("h-5 w-5 rounded-full border border-border transition", c.swatch, color === c.key && "ring-2 ring-primary scale-110")}
                  title={c.label}
                />
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("h-8", reminderAt && "text-primary")}>
                  <Bell className="mr-1 h-3.5 w-3.5" /> {reminderAt ? formatDistanceToNow(new Date(reminderAt), { addSuffix: true }) : "Remind"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <Input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} className="text-xs" />
                {reminderAt && <Button variant="ghost" size="sm" className="mt-2 w-full text-xs" onClick={() => setReminderAt("")}>Clear</Button>}
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="sm" className="h-8" onClick={handleExport} disabled={!content && !title}>
              <Download className="mr-1 h-3.5 w-3.5" /> Export
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{wordCount} words · {readMin} min read</span>
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={submit} className="bg-gradient-primary shadow-glow">Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { colorOptions };
