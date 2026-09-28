import { zh } from "@/lib/asa/zh";
import { useEffect } from "react";
import { FileText, GitCompare, LayoutGrid, ScanSearch, Waypoints } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { AnalysisPanel } from "@/components/asa/analysis-panel";
import { useViewport, cn } from "@/components/asa/bits";
import { CompareView } from "@/components/asa/compare";
import { LibraryPane } from "@/components/asa/library";
import { PatternsView } from "@/components/asa/patterns";
import { ProfileView } from "@/components/asa/profile";
import { useLibrary, type ViewId } from "@/lib/asa/store";

const VIEWS: { id: ViewId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "samples", label: "Samples", icon: LayoutGrid },
  { id: "analysis", label: "Analysis", icon: ScanSearch },
  { id: "patterns", label: "Patterns", icon: Waypoints },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "profile", label: "Profile", icon: FileText },
];

export function Shell() {
  const loadError = useLibrary((state) => state.loadError);
  const view = useLibrary((state) => state.view);
  const setView = useLibrary((state) => state.setView);
  const samples = useLibrary((state) => state.samples);
  const status = useLibrary((state) => state.status);
  const batch = useLibrary((state) => state.batch);
  const load = useLibrary((state) => state.load);
  const selectedId = useLibrary((state) => state.selectedId);
  const { mounted, wide } = useViewport();

  useEffect(() => {
    void load();
  }, [load]);

  const analyzed = samples.filter((sample) => sample.analysis).length;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-medium tracking-wide text-fg">
              {zh("Aesthetic Sample Analyzer")}
            </h1>
            <p className="truncate font-mono text-xs text-faint">
              {zh("Observable traits · your labels · no beauty score")}
            </p>
          </div>
          <p className="ml-auto shrink-0 font-mono text-xs text-muted tabular-nums">
            {zh(samples.length)}
            {zh(" samples · ")}
            {zh(analyzed)}
            {zh(" analyzed ")}
          </p>
        </div>
        <nav aria-label={zh("Sections")} className="flex gap-1 overflow-x-auto px-2 pb-2">
          {VIEWS.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setView(item.id)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm",
                  active
                    ? "bg-raised text-fg shadow-ring"
                    : "text-muted hover:bg-raised hover:text-fg",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {zh(item.label)}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="min-h-0 flex-1">
        {view === "samples" ? (
          <SamplesWorkspace mounted={mounted} wide={wide} selected={Boolean(selectedId)} />
        ) : view === "analysis" ? (
          <AnalysisPanel variant="page" />
        ) : view === "patterns" ? (
          <PatternsView />
        ) : view === "compare" ? (
          <CompareView />
        ) : (
          <ProfileView />
        )}
      </main>
      {loadError || status || batch.running ? (
        <footer className="shrink-0 border-t border-line bg-surface px-3 py-2 text-xs text-muted">
          {loadError ? (
            <span className="text-dislike">
              {zh(loadError)}
              {zh(". ")}
            </span>
          ) : null}
          {zh(batch.running ? `Analyzing ${batch.done}/${batch.total}. ` : "")}
          {zh(status)}
        </footer>
      ) : null}
    </div>
  );
}

function SamplesWorkspace({
  mounted,
  wide,
  selected,
}: {
  mounted: boolean;
  wide: boolean;
  selected: boolean;
}) {
  if (mounted && wide && selected) {
    return (
      <Group orientation="horizontal" className="h-full">
        <Panel id="library" minSize="42%" defaultSize="66%">
          <LibraryPane />
        </Panel>
        <Separator className="asa-sep" />
        <Panel id="inspector" minSize="300px" defaultSize="34%">
          <AnalysisPanel variant="dock" />
        </Panel>
      </Group>
    );
  }
  return (
    <div className="samples-layout">
      <div className="h-full min-w-0 flex-1">
        <LibraryPane />
      </div>
      <aside className={selected ? "inspector-css is-open" : "inspector-css"}>
        {selected ? <AnalysisPanel variant="dock" /> : null}
      </aside>
    </div>
  );
}
