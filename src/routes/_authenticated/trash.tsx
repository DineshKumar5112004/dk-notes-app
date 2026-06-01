import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/hooks/use-app-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/trash")({
  head: () => ({ meta: [{ title: "Trash — Noctis" }] }),
  component: TrashPage,
});

function TrashPage() {
  const { notes, restoreNote, destroyNote, emptyTrash } = useAppData();
  const trashed = notes.filter((n) => n.deleted_at);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">Trash</h1>
          <p className="text-sm text-muted-foreground">Deleted notes live here. Empty to delete forever.</p>
        </div>
        {trashed.length > 0 && (
          <Button variant="destructive" size="sm" onClick={emptyTrash}><Trash2 className="mr-1 h-4 w-4" /> Empty trash</Button>
        )}
      </div>
      {trashed.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/30 p-16 text-center">
          <Trash2 className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Trash is empty.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {trashed.map((n) => (
              <motion.div key={n.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{n.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground">Deleted {formatDistanceToNow(new Date(n.deleted_at!), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => restoreNote(n.id)}><RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore</Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => destroyNote(n.id)}><X className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
