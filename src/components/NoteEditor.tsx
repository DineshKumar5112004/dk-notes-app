import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { colorOptions, type Note, type NoteColor } from "@/components/NoteCard";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (n: { title: string; content: string; color: NoteColor; tags: string[] }) => void;
}

export function NoteEditor({ open, note, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setColor(note?.color ?? "default");
      setTags(note?.tags ?? []);
      setTagInput("");
    }
  }, [open, note]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const submit = () => {
    onSave({ title: title.trim(), content: content.trim(), color, tags });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 px-0 font-display text-xl font-semibold shadow-none focus-visible:ring-0"
          />
          <Textarea
            placeholder="Start writing…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[240px] resize-none border-0 px-0 shadow-none focus-visible:ring-0"
          />
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {colorOptions.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className={cn("h-6 w-6 rounded-full border border-border", c.swatch, color === c.key && "ring-2 ring-primary")}
                  title={c.label}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{wordCount} words · {content.length} chars</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-primary shadow-glow">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
