import { zh } from "@/lib/asa/zh";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LabelId, Sample } from "@/lib/asa/schema";

export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(clsx(parts));
}

export function useViewport() {
  const [state, setState] = useState({ mounted: false, wide: false });
  useEffect(() => {
    const query = window.matchMedia("(min-width: 960px)");
    const apply = () => setState({ mounted: true, wide: query.matches });
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return state;
}

const LABEL_CLASS: Record<LabelId, string> = {
  unrated: "text-faint",
  like: "text-like",
  neutral: "text-muted",
  dislike: "text-dislike",
  core: "text-core",
};

export function labelClass(label: LabelId) {
  return LABEL_CLASS[label];
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "line" | "ghost" | "danger";
};

export function Button({ tone = "line", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass",
        tone === "primary" && "bg-brass text-bg hover:bg-core",
        tone === "line" && "bg-surface text-fg shadow-ring hover:bg-raised",
        tone === "ghost" && "bg-transparent text-fg hover:bg-raised",
        tone === "danger" && "bg-transparent text-dislike hover:bg-raised",
        className,
      )}
      {...props}
    />
  );
}

export function Thumb({
  sample,
  className,
  onClick,
}: {
  sample: Sample;
  className?: string;
  onClick?: () => void;
}) {
  const image = (
    <img
      src={sample.url}
      alt=""
      draggable={false}
      className="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
    />
  );
  if (!onClick)
    return <div className={cn("overflow-hidden bg-raised", className)}>{zh(image)}</div>;
  return (
    <button
      type="button"
      aria-label={sample.fileName}
      onClick={onClick}
      className={cn("overflow-hidden bg-raised", className)}
    >
      {zh(image)}
    </button>
  );
}

export function Panel({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line py-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-fg">{zh(title)}</h2>
        {meta ? <p className="font-mono text-xs text-faint tabular-nums">{zh(meta)}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export function Caution({ children }: { children: ReactNode }) {
  return <p className="border border-line bg-raised px-3 py-2 text-sm text-warn">{children}</p>;
}
