import { Pin, PinOff, Archive, ArchiveRestore, Trash2, Palette, Bell, Folder as FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppData, type Note, type NoteColor } from "@/hooks/use-app-data";
import { colorOptions } from "@/components/NoteEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const colorClass: Record<NoteColor, string> = {
  default: "bg-note-default",
  indigo: "bg-note-indigo",
  violet: "bg-note-violet",
  rose: "bg-note-rose",
  amber: "bg-note-amber",
  emerald: "bg-note-emerald",
  sky: "bg-note-sky",
};

interface Props {
  note: Note;
  onClick: () => void;
  variant?: "grid" | "list";
}

export function NoteCard({ note, onClick, variant = "grid" }: Props) {
  const { folders, updateNote, trashNote } = useAppData();
  const folder = folders.find((f) => f.id === note.folder_id);
  const inTrash = !!note.deleted_at;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      whileHover={{ y: -2 }}
      className={cn("break-inside-avoid mb-4", variant === "list" && "mb-2")}
    >
      <div
        className={cn(
          "group relative flex flex-col rounded-2xl border border-border p-4 shadow-card transition hover:border-primary/40 hover:shadow-glow cursor-pointer",
          colorClass[note.color],
          variant === "list" && "flex-row items-center gap-4 py-3"
        )}
        onClick={onClick}
      >
        {note.pinned && !inTrash && (
          <Pin className="absolute right-3 top-3 h-3.5 w-3.5 text-primary fill-primary" />
        )}

        <div className={cn("flex-1 min-w-0", variant === "list" && "flex items-center gap-3")}>
          <h3 className={cn("line-clamp-2 pr-6 font-display text-base font-semibold", variant === "list" && "line-clamp-1 pr-0 max-w-[40%]")}>
            {note.title || <span className="text-muted-foreground">Untitled</span>}
          </h3>

          {variant === "grid" && note.content && (
            <div className="prose-notes mt-2 line-clamp-6 text-sm text-muted-foreground [&_*]:!my-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content.slice(0, 400)}</ReactMarkdown>
            </div>
          )}
          {variant === "list" && (
            <p className="line-clamp-1 flex-1 text-sm text-muted-foreground">{note.content.slice(0, 120)}</p>
          )}

          {variant === "grid" && (note.tags.length > 0 || folder || note.reminder_at) && (
            <div className="mt-3 flex flex-wrap items-center gap-1">
              {folder && (
                <Badge variant="outline" className="gap-1 text-[10px]"><FolderIcon className="h-2.5 w-2.5" /> {folder.name}</Badge>
              )}
              {note.reminder_at && (
                <Badge variant="outline" className="gap-1 border-primary/40 text-[10px] text-primary"><Bell className="h-2.5 w-2.5" /> {formatDistanceToNow(new Date(note.reminder_at), { addSuffix: true })}</Badge>
              )}
              {note.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className={cn("mt-3 flex items-center justify-between", variant === "list" && "mt-0 ml-auto")}>
          <span className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </span>
          <div className="ml-2 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100" onClick={stop}>
            {!inTrash && (
              <>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateNote(note.id, { pinned: !note.pinned })} title={note.pinned ? "Unpin" : "Pin"}>
                  {note.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Color"><Palette className="h-3.5 w-3.5" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" onClick={stop}>
                    <div className="grid grid-cols-7 gap-1">
                      {colorOptions.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => updateNote(note.id, { color: c.key })}
                          className={cn("h-7 w-7 rounded-full border border-border", c.swatch, note.color === c.key && "ring-2 ring-primary")}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateNote(note.id, { archived: !note.archived })} title={note.archived ? "Unarchive" : "Archive"}>
                  {note.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                </Button>
              </>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => trashNote(note.id)} title="Move to trash">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
