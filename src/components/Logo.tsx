import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  showWord?: boolean;
  showBadge?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "h-7 w-7", word: "text-lg" },
  md: { box: "h-8 w-8", word: "text-xl" },
  lg: { box: "h-12 w-12", word: "text-3xl" },
};

/** Unified Noctis brand mark — same on landing, login, dashboard, and every page. */
export function LogoMark({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = sizes[size];
  return (
    <div className={cn("relative grid place-items-center rounded-lg border border-border/80 bg-card", s.box, className)}>
      <div className="absolute inset-1 rounded-md bg-mint opacity-90" />
      <div className="absolute inset-2 rounded-sm bg-background" />
      <div className="absolute h-1 w-1 rounded-full bg-mint shadow-glow" />
    </div>
  );
}

export function Logo({ to = "/", size = "md", showWord = true, showBadge = false, className }: LogoProps) {
  const s = sizes[size];
  const content = (
    <>
      <LogoMark size={size} />
      {showWord && (
        <span className={cn("font-display tracking-tight text-foreground", s.word)}>Noctis</span>
      )}
      {showBadge && (
        <span className="ml-1 hidden rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline">
          v2.0
        </span>
      )}
    </>
  );
  if (!to) return <div className={cn("flex items-center gap-2.5", className)}>{content}</div>;
  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)} aria-label="Noctis home">
      {content}
    </Link>
  );
}
