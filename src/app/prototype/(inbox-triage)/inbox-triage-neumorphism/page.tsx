"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  FileText,
  GripVertical,
  Inbox,
  Layers3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Scratch = {
  id: string;
  title: string;
  createdAt: string;
};

type Idea = {
  id: string;
  title: string;
  createdAt: string;
};

type NodeCandidate = {
  id: string;
  title: string;
  color: string;
};

type BitCandidate = {
  id: string;
  title: string;
};

type HierarchyNode = {
  id: string;
  title: string;
  color: string;
};

type HierarchyBit = {
  id: string;
  title: string;
};

const scratchesSeed: Scratch[] = [
  { id: "s1", title: "Finish GridDO lifecycle plan", createdAt: "2h ago" },
  { id: "s2", title: "Review Gemini prototype direction", createdAt: "yesterday" },
  { id: "s3", title: "Prepare product direction notes", createdAt: "2 days ago" },
  { id: "s4", title: "Organize archive and review mode questions", createdAt: "6 days ago" },
  { id: "s5", title: "Write down backup/export workflow idea", createdAt: "05/04/26" },
];

const ideasSeed: Idea[] = [
  { id: "i1", title: "Check theme/calendar extraction quality", createdAt: "10m ago" },
  { id: "i2", title: "Ask Codex to merge final decision docs", createdAt: "7m ago" },
  { id: "i3", title: "Review Claude code quality before merging", createdAt: "4m ago" },
];

const hierarchyData: Record<string, { nodes: HierarchyNode[]; bits: HierarchyBit[] }> = {
  home: {
    nodes: [
      { id: "work", title: "Work", color: "#7c8cff" },
      { id: "griddo", title: "GridDO", color: "#7cc6a4" },
      { id: "life", title: "Personal", color: "#f1a7c7" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "research", title: "Research", color: "#9da8ff" },
      { id: "writing", title: "Writing", color: "#b6a1ff" },
    ],
    bits: [
      { id: "b-work-1", title: "Reply to the long project update thread before Friday" },
    ],
  },
  griddo: {
    nodes: [
      { id: "lifecycle", title: "Lifecycle Features", color: "#7cc6a4" },
      { id: "calendar", title: "Calendar Redesign", color: "#f7c56b" },
    ],
    bits: [
      { id: "b-griddo-1", title: "Compare Inbox/Triage visual polish against theme direction and note edge cases" },
    ],
  },
  lifecycle: {
    nodes: [
      { id: "capture", title: "Quick Capture", color: "#7c8cff" },
      { id: "triage", title: "Inbox / Triage", color: "#7cc6a4" },
    ],
    bits: [
      { id: "b-life-1", title: "Define Archive as non-destructive lifecycle state, not a real container node" },
      { id: "b-life-2", title: "Check whether Scratch should remain product language only" },
    ],
  },
  triage: {
    nodes: [],
    bits: [
      { id: "b-t-1", title: "Validate Scratch Pool auto-collapse behavior with keyboard focus" },
      { id: "b-t-2", title: "Tune Node/Bit staging ratio against long Bit labels and compact Node cards" },
    ],
  },
};

function SoftPanel({
  children,
  className,
  inset = false,
}: {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--theme-radius)] bg-[var(--theme-card-bg)]",
        inset ? "shadow-[inset_6px_6px_12px_#c5c9d1,inset_-6px_-6px_12px_#ffffff]" : "shadow-[var(--theme-shadow)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff]">
          {icon}
        </span>
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {title}
        </span>
      </div>
      {meta ? (
        <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 shadow-[inset_2px_2px_5px_#c5c9d1,inset_-2px_-2px_5px_#ffffff]">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function NodeToken({ node }: { node: { title: string; color: string } }) {
  return (
    <div className="group grid aspect-square min-h-0 cursor-grab place-items-center rounded-[18px] bg-[var(--theme-card-bg)] p-3 text-center shadow-[6px_6px_12px_#c5c9d1,-6px_-6px_12px_#ffffff] transition duration-200 hover:-translate-y-0.5 hover:shadow-[9px_9px_16px_#c5c9d1,-9px_-9px_16px_#ffffff]">
      <div
        className="mb-2 grid size-9 place-items-center rounded-2xl shadow-[inset_4px_4px_8px_#c5c9d1,inset_-4px_-4px_8px_#ffffff]"
        style={{ color: node.color }}
      >
        <Box size={20} />
      </div>
      <span className="max-w-full truncate text-[10px] font-semibold text-zinc-600">
        {node.title}
      </span>
    </div>
  );
}

function BitToken({ bit }: { bit: { title: string } }) {
  return (
    <div className="group flex cursor-grab items-center gap-3 rounded-[18px] bg-[var(--theme-card-bg)] px-3 py-3 shadow-[5px_5px_10px_#c5c9d1,-5px_-5px_10px_#ffffff] transition duration-200 hover:-translate-y-0.5 hover:shadow-[8px_8px_14px_#c5c9d1,-8px_-8px_14px_#ffffff]">
      <span className="h-8 w-1.5 shrink-0 rounded-full bg-zinc-300 transition group-hover:bg-[#7c8cff]" />
      <FileText className="size-4 shrink-0 text-zinc-400" />
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-600">
        {bit.title}
      </span>
    </div>
  );
}

function HierarchyNodeRow({
  node,
  selected,
}: {
  node: { title: string; color: string };
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition duration-200",
        selected
          ? "shadow-[inset_5px_5px_10px_#c5c9d1,inset_-5px_-5px_10px_#ffffff]"
          : "shadow-[4px_4px_9px_#c5c9d1,-4px_-4px_9px_#ffffff] hover:-translate-y-0.5",
      )}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-2xl shadow-[inset_4px_4px_8px_#c5c9d1,inset_-4px_-4px_8px_#ffffff]"
        style={{ color: node.color }}
      >
        <Box size={17} />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-600">
        {node.title}
      </span>
      <ChevronRight className="size-4 shrink-0 text-zinc-300 transition group-hover:text-zinc-500" />
    </div>
  );
}

function HierarchyBitRow({ bit }: { bit: { title: string } }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[18px] px-3 py-2.5 shadow-[inset_3px_3px_7px_#c5c9d1,inset_-3px_-3px_7px_#ffffff]">
      <span className="h-7 w-1.5 shrink-0 rounded-full bg-zinc-300" />
      <FileText className="size-4 shrink-0 text-zinc-400" />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-500">
        {bit.title}
      </span>
    </div>
  );
}

export default function InboxTriageNeumorphismPrototype() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "n1", title: "Prototype Review", color: "#7c8cff" },
    { id: "n2", title: "Docs Merge", color: "#7cc6a4" },
  ]);
  const [bitCandidates, setBitCandidates] = useState<BitCandidate[]>([
    { id: "b1", title: "Inspect New Morphism visual density" },
    { id: "b2", title: "Check long Bit title truncation in hierarchy placement" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [path, setPath] = useState(["home"]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ level: number; title: string; type: "node" | "bit" } | null>(null);

  useEffect(() => {
    const previous = document.documentElement.dataset.colorTheme;
    document.documentElement.dataset.colorTheme = "neumorphism";
    return () => {
      if (previous) document.documentElement.dataset.colorTheme = previous;
      else delete document.documentElement.dataset.colorTheme;
    };
  }, []);

  const selectedScratch = scratches.find((scratch) => scratch.id === selectedScratchId) ?? scratches[0];

  const columns = useMemo(() => [0, 1, 2, 3], []);

  function addIdea(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newIdea.trim();
    if (!title) return;
    setIdeas((current) => [...current, { id: `i-${Date.now()}`, title, createdAt: "just now" }]);
    setNewIdea("");
  }

  function startDrag(event: React.DragEvent, id: string, type: string) {
    event.dataTransfer.setData("id", id);
    event.dataTransfer.setData("type", type);
  }

  function dropIdea(event: React.DragEvent, target: "node" | "bit") {
    event.preventDefault();
    const id = event.dataTransfer.getData("id");
    const type = event.dataTransfer.getData("type");
    if (type !== "idea") return;

    const idea = ideas.find((item) => item.id === id);
    if (!idea) return;

    if (target === "node") {
      setNodeCandidates((current) => [
        ...current,
        { id: `node-${Date.now()}`, title: idea.title, color: "#7c8cff" },
      ]);
    } else {
      setBitCandidates((current) => [...current, { id: `bit-${Date.now()}`, title: idea.title }]);
    }

    setIdeas((current) => current.filter((item) => item.id !== id));
    setDragOver(null);
  }

  function dropCandidate(event: React.DragEvent, level: number) {
    event.preventDefault();
    const id = event.dataTransfer.getData("id");
    const type = event.dataTransfer.getData("type");

    if (type === "node-candidate") {
      const candidate = nodeCandidates.find((item) => item.id === id);
      if (!candidate) return;
      setNodeCandidates((current) => current.filter((item) => item.id !== id));
      setPlaced({ level, title: candidate.title, type: "node" });
    }

    if (type === "bit-candidate") {
      const candidate = bitCandidates.find((item) => item.id === id);
      if (!candidate) return;
      setBitCandidates((current) => current.filter((item) => item.id !== id));
      setPlaced({ level, title: candidate.title, type: "bit" });
    }

    setDragOver(null);
  }

  function openNode(nodeId: string, level: number) {
    const next = path.slice(0, level + 1);
    next.push(nodeId);
    setPath(next);
    setActiveLevel(Math.min(level + 1, 3));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--page-bg)] px-5 py-4 text-zinc-700">
      <div className="mb-4 flex h-12 items-center justify-between rounded-[var(--theme-radius)] bg-[var(--theme-card-bg)] px-5 shadow-[var(--theme-shadow)]">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-full shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff]">
            <Layers3 size={16} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
              Inbox / Triage Prototype
            </p>
            <h1 className="text-sm font-semibold text-zinc-700">New Morphism Integrated Candidate</h1>
          </div>
        </div>
        <div className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 shadow-[inset_3px_3px_7px_#c5c9d1,inset_-3px_-3px_7px_#ffffff]">
          Structure locked from DECISION.md
        </div>
      </div>

      <div className="flex h-[calc(100vh-5.5rem)] gap-5 overflow-hidden">
        <SoftPanel className={cn("flex shrink-0 flex-col transition-[width] duration-300", poolCollapsed ? "w-16" : "w-72")}>
          <div
            className={cn(
              "flex h-12 shrink-0 items-center",
              poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-4 px-2" : "justify-between px-3",
            )}
          >
            <div className={cn("flex min-w-0 items-center", poolCollapsed ? "flex-col gap-2" : "gap-2")}>
              <span className="relative grid size-7 shrink-0 place-items-center rounded-full shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff]">
                <Inbox size={15} />
                {poolCollapsed ? (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[var(--theme-card-bg)] text-[9px] font-bold text-zinc-500 shadow-[2px_2px_4px_#c5c9d1,-2px_-2px_4px_#ffffff]">
                    {scratches.length}
                  </span>
                ) : null}
              </span>
              {!poolCollapsed ? (
                <>
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                    Scratch Pool
                  </span>
                  <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 shadow-[inset_2px_2px_5px_#c5c9d1,inset_-2px_-2px_5px_#ffffff]">
                    {scratches.length} items
                  </span>
                </>
              ) : null}
            </div>
            <button
              aria-label={poolCollapsed ? "Open Scratch Pool" : "Collapse Scratch Pool"}
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-zinc-500 shadow-[3px_3px_7px_#c5c9d1,-3px_-3px_7px_#ffffff] transition hover:-translate-y-0.5",
                poolCollapsed ? "" : "ml-auto"
              )}
              onClick={() => setPoolCollapsed((value) => !value)}
              type="button"
            >
              {poolCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
          <div className={cn("flex-1 overflow-y-auto px-3 pb-4", poolCollapsed ? "space-y-4" : "space-y-3")}>
            {poolCollapsed ? (
              <div className="flex flex-col items-center gap-4 pt-2">
                {scratches.map((scratch) => (
                  <button
                    aria-label={scratch.title}
                    className={cn(
                      "size-3 rounded-full transition",
                      selectedScratchId === scratch.id
                        ? "bg-zinc-600 shadow-[0_0_0_5px_hsl(0_0%_100%_/_0.6)]"
                        : "bg-zinc-300 shadow-[inset_2px_2px_4px_#c5c9d1,inset_-2px_-2px_4px_#ffffff]",
                    )}
                    key={scratch.id}
                    onClick={() => setSelectedScratchId(scratch.id)}
                    type="button"
                  />
                ))}
              </div>
            ) : (
              scratches.map((scratch) => (
                <button
                  className={cn(
                    "w-full rounded-[18px] px-4 py-3 text-left transition",
                    selectedScratchId === scratch.id
                      ? "text-zinc-700 shadow-[inset_5px_5px_10px_#c5c9d1,inset_-5px_-5px_10px_#ffffff]"
                      : "shadow-[5px_5px_10px_#c5c9d1,-5px_-5px_10px_#ffffff] hover:-translate-y-0.5",
                  )}
                  key={scratch.id}
                  onClick={() => setSelectedScratchId(scratch.id)}
                  type="button"
                >
                  <p className="truncate text-sm font-semibold">{scratch.title}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    {scratch.createdAt}
                  </p>
                </button>
              ))
            )}
          </div>
        </SoftPanel>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="grid min-h-0 flex-[3] grid-cols-[3fr_2fr] gap-5">
            <SoftPanel className="flex min-w-0 flex-col overflow-hidden" inset={false}>
              <SectionHeader
                icon={<FileText size={15} />}
                title="Breakdown / Scribble"
                meta={selectedScratch.title}
              />
              <div
                className="flex-1 overflow-y-auto px-4 pb-3"
                onFocus={() => setPoolCollapsed(true)}
              >
                <div className="space-y-3">
                  {ideas.map((idea, index) => (
                    <div
                      className="flex items-center gap-3 rounded-[18px] px-3 py-3 shadow-[4px_4px_9px_#c5c9d1,-4px_-4px_9px_#ffffff] transition hover:-translate-y-0.5"
                      data-testid={`idea-${idea.id}`}
                      draggable
                      key={idea.id}
                      onDragStartCapture={(event) => startDrag(event, idea.id, "idea")}
                    >
                      <GripVertical className="size-4 shrink-0 text-zinc-300" />
                      <span className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-zinc-400 shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff]">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-600">
                        {idea.title}
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                        {idea.createdAt}
                      </span>
                      <button
                        className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-400 shadow-[4px_4px_8px_#c5c9d1,-4px_-4px_8px_#ffffff] transition hover:text-rose-500"
                        onClick={() => setIdeas((current) => current.filter((item) => item.id !== idea.id))}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <form className="flex shrink-0 items-center gap-3 px-4 pb-4" onSubmit={addIdea}>
                <div className="grid size-10 place-items-center rounded-full text-zinc-400 shadow-[inset_4px_4px_8px_#c5c9d1,inset_-4px_-4px_8px_#ffffff]">
                  <Plus size={17} />
                </div>
                  <input
                    className="min-w-0 flex-1 rounded-full bg-transparent px-4 py-3 text-sm font-semibold outline-none shadow-[inset_5px_5px_10px_#c5c9d1,inset_-5px_-5px_10px_#ffffff] placeholder:text-zinc-300"
                    data-testid="idea-input"
                    onChange={(event) => setNewIdea(event.target.value)}
                    placeholder="Scribble another idea..."
                    value={newIdea}
                />
              </form>
            </SoftPanel>

            <SoftPanel className="flex min-w-0 flex-col overflow-hidden">
              <SectionHeader icon={<CircleDot size={15} />} title="Staging" />
              <div className="grid min-h-0 flex-1 grid-cols-[35fr_65fr] gap-3 px-4 pb-4">
                <div
                  className={cn(
                    "flex min-w-0 flex-col rounded-[20px] p-3 transition",
                    dragOver === "node"
                      ? "shadow-[inset_7px_7px_14px_#b7bfcc,inset_-7px_-7px_14px_#ffffff]"
                      : "shadow-[inset_4px_4px_9px_#c5c9d1,inset_-4px_-4px_9px_#ffffff]",
                  )}
                  data-testid="node-zone"
                  onDragLeave={() => setDragOver(null)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver("node");
                  }}
                  onDrop={(event) => dropIdea(event, "node")}
                >
                  <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Nodes
                  </p>
                  <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {nodeCandidates.map((node) => (
                      <motion.div
                        layoutId={node.id}
                        data-testid={`node-candidate-${node.id}`}
                        draggable
                        key={node.id}
                        onDragStartCapture={(event) => startDrag(event, node.id, "node-candidate")}
                      >
                        <NodeToken node={node} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div
                  className={cn(
                    "flex min-w-0 flex-col rounded-[20px] p-3 transition",
                    dragOver === "bit"
                      ? "shadow-[inset_7px_7px_14px_#b7bfcc,inset_-7px_-7px_14px_#ffffff]"
                      : "shadow-[inset_4px_4px_9px_#c5c9d1,inset_-4px_-4px_9px_#ffffff]",
                  )}
                  data-testid="bit-zone"
                  onDragLeave={() => setDragOver(null)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver("bit");
                  }}
                  onDrop={(event) => dropIdea(event, "bit")}
                >
                  <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Bits
                  </p>
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {bitCandidates.map((bit) => (
                      <motion.div
                        layoutId={bit.id}
                        data-testid={`bit-candidate-${bit.id}`}
                        draggable
                        key={bit.id}
                        onDragStartCapture={(event) => startDrag(event, bit.id, "bit-candidate")}
                      >
                        <BitToken bit={bit} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </SoftPanel>
          </div>

          <SoftPanel className="flex min-h-0 flex-[2] flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center justify-between px-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full shadow-[inset_3px_3px_6px_#c5c9d1,inset_-3px_-3px_6px_#ffffff]">
                  <Search size={15} />
                </span>
                <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Hierarchy Explorer / Placement
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden min-w-[220px] items-center gap-2 rounded-full px-3 py-1.5 text-zinc-400 shadow-[inset_3px_3px_7px_#c5c9d1,inset_-3px_-3px_7px_#ffffff] lg:flex">
                  <Search size={12} />
                  <span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Search hierarchy
                  </span>
                </div>
                <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 shadow-[inset_2px_2px_5px_#c5c9d1,inset_-2px_-2px_5px_#ffffff]">
                  Home-L3
                </span>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-4 gap-3 px-4 pb-4">
              {columns.map((level) => {
                const columnId = level === 0 ? "home" : path[level];
                const column = hierarchyData[columnId] ?? { nodes: [], bits: [] };
                const disabled = level > activeLevel;
                const isDrop = dragOver === `h-${level}`;
                const items = [
                  ...column.nodes.map((node) => ({ ...node, type: "node" as const })),
                  ...column.bits.map((bit) => ({ ...bit, type: "bit" as const })),
                ];

                return (
                  <div
                    className={cn(
                      "flex min-w-0 flex-col rounded-[20px] p-3 transition",
                      disabled && "opacity-35",
                      isDrop
                        ? "shadow-[inset_8px_8px_15px_#b7bfcc,inset_-8px_-8px_15px_#ffffff]"
                        : "shadow-[inset_4px_4px_9px_#c5c9d1,inset_-4px_-4px_9px_#ffffff]",
                    )}
                    data-testid={`hierarchy-column-${level}`}
                    key={level}
                    onDragLeave={() => setDragOver(null)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (!disabled) setDragOver(`h-${level}`);
                    }}
                    onDrop={(event) => {
                      if (!disabled) dropCandidate(event, level);
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        {level === 0 ? "Home" : `L${level}`}
                      </span>
                      {activeLevel === level ? <Check className="size-3 text-zinc-400" /> : null}
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                      <AnimatePresence initial={false}>
                        {items.map((item) =>
                          item.type === "node" ? (
                            <motion.button
                              layout
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="w-full text-left"
                              key={item.id}
                              onClick={() => openNode(item.id, level)}
                              type="button"
                            >
                              <HierarchyNodeRow node={item} selected={path[level + 1] === item.id} />
                            </motion.button>
                          ) : (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              key={item.id}
                            >
                              <HierarchyBitRow bit={item} />
                            </motion.div>
                          ),
                        )}
                        {placed?.level === level ? (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="rounded-[18px] px-3 py-2 text-xs font-semibold text-zinc-500 shadow-[inset_4px_4px_8px_#c5c9d1,inset_-4px_-4px_8px_#ffffff]"
                          >
                            Placed {placed.type}: <span className="truncate">{placed.title}</span>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </SoftPanel>
        </div>
      </div>
    </main>
  );
}
