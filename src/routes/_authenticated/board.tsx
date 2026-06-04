import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useDroppable, useDraggable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Folder as FolderIcon, Inbox, Pin } from "lucide-react";
import { useAppData, type Note } from "@/hooks/use-app-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/board")({
  head: () => ({ meta: [{ title: "Board — Noctis" }] }),
  component: BoardPage,
});

function BoardPage() {
  const { notes, folders, updateNote } = useAppData();
  const active = notes.filter((n) => !n.deleted_at && !n.archived);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columns = useMemo(() => {
    return [
      { id: "inbox", name: "Inbox", color: "var(--muted-foreground)", icon: Inbox, notes: active.filter((n) => !n.folder_id) },
      ...folders.map((f) => ({
        id: f.id,
        name: f.name,
        color: "var(--primary)",
        icon: FolderIcon,
        notes: active.filter((n) => n.folder_id === f.id),
      })),
    ];
  }, [active, folders]);

  const onDragEnd = (e: DragEndEvent) => {
    setDraggingId(null);
    const noteId = e.active.id as string;
    const colId = e.over?.id as string | undefined;
    if (!colId) return;
    const target = colId === "inbox" ? null : colId;
    const note = notes.find((n) => n.id === noteId);
    if (note && note.folder_id !== target) updateNote(noteId, { folder_id: target } as any);
  };

  const draggingNote = draggingId ? notes.find((n) => n.id === draggingId) : null;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Board</h1>
        <p className="text-sm text-muted-foreground">Drag notes between folders. Changes save instantly.</p>
      </div>

      <DndContext sensors={sensors} onDragStart={(e: DragStartEvent) => setDraggingId(e.active.id as string)} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((c) => (
            <Column key={c.id} id={c.id} name={c.name} count={c.notes.length}>
              {c.notes.map((n) => <Card key={n.id} note={n} />)}
              {c.notes.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Drop notes here
                </div>
              )}
            </Column>
          ))}
        </div>
        <DragOverlay>{draggingNote ? <Card note={draggingNote} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ id, name, count, children }: { id: string; name: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="font-display text-sm font-semibold">{name}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{count}</span>
      </div>
      <div ref={setNodeRef} className={cn(
        "min-h-[60vh] flex-1 space-y-2 rounded-2xl border bg-card/40 p-2 transition",
        isOver ? "border-primary bg-card shadow-glow" : "border-border"
      )}>
        {children}
      </div>
    </div>
  );
}

function Card({ note, dragging }: { note: Note; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: note.id });
  const style: React.CSSProperties = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn(
        "cursor-grab rounded-xl border border-border bg-card p-3 shadow-card transition hover:border-primary/50 hover:shadow-glow active:cursor-grabbing",
        isDragging && "opacity-30",
        dragging && "ring-glow rotate-1"
      )}
      onClick={() => window.dispatchEvent(new CustomEvent("noctis:openEditor", { detail: note.id }))}
    >
      <div className="mb-1 flex items-center gap-1.5">
        {note.pinned && <Pin className="h-3 w-3 text-primary" />}
        <h4 className="line-clamp-1 font-display text-sm font-semibold">{note.title || "Untitled"}</h4>
      </div>
      <p className="line-clamp-3 text-xs text-muted-foreground">{note.content || "Empty"}</p>
      {note.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">#{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
