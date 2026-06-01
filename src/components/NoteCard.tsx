import { Pin, PinOff, Archive, ArchiveRestore, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export type NoteColor = "default" | "indigo" | "violet" | "rose" | "amber" | "emerald" | "sky";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  tags: string[];
  updated_at: string;
}

const colorClass: Record<NoteColor, string> = {
  default: "bg-note-default",
  indigo: "bg-note-indigo",
  violet: "bg-note-violet",
  rose: "bg-note-rose",
  amber: "bg-note-amber",
  emerald: "bg-note-emerald",
  sky: "bg-note-sky",
};

const colorOptions: { key: NoteColor; label: string; swatch: string }[] = [
  { key: "default", label: "Default", swatch: "bg-note-default" },
  { key: "indigo", label: "Indigo", swatch: "bg-note-indigo" },
  { key: "violet", label: "Violet", swatch: "bg-note-violet" },
  { key: "rose", label: "Rose", swatch: "bg-note-rose" },
  { key: "amber", label: "Amber", swatch: "bg-note-amber" },
  { key: "emerald", label: "Emerald", swatch: "bg-note-emerald" },
  { key: "sky", label: "Sky", swatch: "bg-note-sky" },
];

interface Props {
  note: Note;
  onClick: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onColor: (c: NoteColor) => void;
}

export function NoteCard({ note, onClick, onTogglePin, onToggleArchive, onDelete, onColor }: Props) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow cursor-pointer break-inside-avoid mb-4",
        colorClass[note.color]
      )}
      onClick={onClick}
    >
      {note.pinned && (
        <Pin className="absolute right-3 top-3 h-3.5 w-3.5 text-primary" />
      )}
      <h3 className="line-clamp-2 pr-6 font-display text-base font-semibold">
        {note.title || <span className="text-muted-foreground">Untitled</span>}
      </h3>
      {note.content && (
        <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">
          {note.content}
        </p>
      )}
      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {note.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onTogglePin} title={note.pinned ? "Unpin" : "Pin"}>
            {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7" title="Color"><Palette className="h-3.5 w-3.5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-7 gap-1">
                {colorOptions.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => onColor(c.key)}
                    className={cn("h-7 w-7 rounded-full border border-border", c.swatch, note.color === c.key && "ring-2 ring-primary")}
                    title={c.label}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onToggleArchive} title={note.archived ? "Unarchive" : "Archive"}>
            {note.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { colorOptions };
