"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  X,
  Scissors,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// --- Types ---

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

// --- Mock Data ---

const scratchesSeed: Scratch[] = [
  { id: "s1", title: "Quarterly review preparation", createdAt: "2h ago" },
  { id: "s2", title: "New theme brainstorming notes", createdAt: "yesterday" },
  { id: "s3", title: "Home office layout ideas", createdAt: "2 days ago" },
  { id: "s4", title: "Summer vacation itinerary draft", createdAt: "6 days ago" },
  { id: "s5", title: "Weekly grocery list (automated?)", createdAt: "05/04/26" },
];

const ideasSeed: Idea[] = [
  { id: "i1", title: "Check budget for standing desk", createdAt: "10m ago" },
  { id: "i2", title: "Measure window dimensions for blinds", createdAt: "7m ago" },
  { id: "i3", title: "Research ergonomic chair reviews", createdAt: "4m ago" },
];

const hierarchyData: Record<string, { nodes: HierarchyNode[]; bits: HierarchyBit[] }> = {
  home: {
    nodes: [
      { id: "work", title: "Work", color: "#4f46e5" },
      { id: "personal", title: "Personal", color: "#10b981" },
      { id: "projects", title: "Projects", color: "#f59e0b" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "meeting", title: "Meetings", color: "#4f46e5" },
      { id: "admin", title: "Admin", color: "#6366f1" },
    ],
    bits: [
      { id: "b-work-1", title: "Reply to project lead's email" },
    ],
  },
  personal: {
    nodes: [
      { id: "health", title: "Health", color: "#059669" },
      { id: "finance", title: "Finance", color: "#d97706" },
    ],
    bits: [
      { id: "b-pers-1", title: "Book dentist appointment" },
    ],
  },
  projects: {
    nodes: [
      { id: "griddo", title: "GridDO Development", color: "#ec4899" },
    ],
    bits: [],
  },
  griddo: {
    nodes: [],
    bits: [
      { id: "b-g-1", title: "Refactor theme engine for Origami" },
      { id: "b-g-2", title: "Implement hierarchy explorer prototype" },
    ],
  },
};

// --- Origami Styled Components ---

const ORIGAMI_RADIUS = "2px 12px 2px 12px / 12px 2px 12px 2px";

function PaperPanel({
  children,
  className,
  intensity = "light",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "deep" | "accent";
}) {
  const bgClass = {
    light: "bg-[hsl(40_20%_98%)] border-[hsl(40_10%_80%)]",
    deep: "bg-[hsl(40_20%_95%)] border-[hsl(40_10%_75%)]",
    accent: "bg-[hsl(40_20%_90%)] border-[hsl(40_10%_70%)]",
  }[intensity];

  return (
    <div
      className={cn(
        "border-[1px] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] transition-all",
        bgClass,
        className
      )}
      style={{ borderRadius: ORIGAMI_RADIUS }}
    >
      {children}
    </div>
  );
}

function FacetedHeader({
  icon,
  title,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
}) {
  return (
    <div 
      className="flex h-12 shrink-0 items-center justify-between px-4 border-b border-[hsl(40_10%_85%)]"
      style={{ background: "linear-gradient(135deg, hsl(40 20% 98%) 0%, hsl(40 20% 95%) 100%)" }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[hsl(40_10%_40%)]">
          {icon}
        </span>
        <span className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(40_10%_20%)]">
          {title}
        </span>
      </div>
      {meta ? (
        <span className="rounded-sm bg-[hsl(40_20%_90%)] px-2 py-0.5 text-[9px] font-mono text-[hsl(40_10%_50%)] border border-[hsl(40_10%_80%)]">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function IdeaCard({ idea, index, onRemove, onDragStartCapture }: {
  idea: Idea; 
  index: number; 
  onRemove: (id: string) => void;
  onDragStartCapture: (e: React.DragEvent) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStartCapture={onDragStartCapture}
      className="group relative flex items-center gap-3 bg-white border border-[hsl(40_10%_85%)] p-3 shadow-[1px_1px_0px_rgba(0,0,0,0.05)] cursor-grab active:cursor-grabbing hover:border-[hsl(40_10%_70%)] transition-colors"
      style={{ borderRadius: "1px 6px 1px 6px / 6px 1px 6px 1px" }}
    >
      <div className="flex flex-col gap-0.5 text-[hsl(40_10%_80%)] group-hover:text-[hsl(40_10%_60%)]">
        <GripVertical size={14} />
      </div>
      <div className="flex size-5 shrink-0 items-center justify-center bg-[hsl(40_20%_95%)] border border-[hsl(40_10%_85%)] text-[9px] font-mono text-[hsl(40_10%_50%)]">
        {index + 1}
      </div>
      <span className="flex-1 text-xs font-medium text-[hsl(40_10%_20%)] leading-relaxed">
        {idea.title}
      </span>
      <span className="text-[9px] font-mono text-[hsl(40_10%_60%)]">
        {idea.createdAt}
      </span>
      <button 
        onClick={() => onRemove(idea.id)}
        className="size-6 flex items-center justify-center rounded-sm text-[hsl(40_10%_80%)] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={12} />
      </button>

      {/* Folded corner decoration */}
      <div className="absolute top-0 right-0 size-2 bg-[hsl(40_20%_95%)] border-l border-b border-[hsl(40_10%_85%)] pointer-events-none" 
           style={{ borderTopRightRadius: "6px 1px" }} />
    </motion.div>
  );
}

function NodeCandidateCard({ node, onDragStartCapture }: { node: NodeCandidate; onDragStartCapture: (e: React.DragEvent) => void }) {
  return (
    <motion.div
      layoutId={node.id}
      draggable
      onDragStartCapture={onDragStartCapture}
      whileHover={{ y: -2, rotate: 1 }}
      className="flex aspect-square cursor-grab flex-col items-center justify-center bg-white border border-[hsl(40_10%_85%)] p-2 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderRadius: "2px 8px 2px 8px / 8px 2px 8px 2px" }}
    >
      <div
        className="mb-1 rounded-sm p-2 border"
        style={{ borderColor: `${node.color}40`, color: node.color, background: `linear-gradient(135deg, white 0%, ${node.color}10 100%)` }}
      >
        <Box size={20} />
      </div>
      <span className="w-full truncate text-center text-[9px] font-bold uppercase tracking-tighter text-[hsl(40_10%_30%)]">
        {node.title}
      </span>
    </motion.div>
  );
}

function BitCandidateCard({ bit, onDragStartCapture }: { bit: BitCandidate; onDragStartCapture: (e: React.DragEvent) => void }) {
  return (
    <motion.div
      layoutId={bit.id}
      draggable
      onDragStartCapture={onDragStartCapture}
      whileHover={{ x: 2 }}
      className="flex cursor-grab items-center gap-2 bg-white border border-[hsl(40_10%_85%)] px-3 py-2 shadow-sm hover:border-[hsl(40_10%_70%)] transition-colors"
      style={{ borderRadius: "1px 6px 1px 6px / 6px 1px 6px 1px" }}
    >
      <div className="size-1 bg-[hsl(40_10%_70%)]" style={{ borderRadius: "50% 10% 50% 10%" }} />
      <FileText className="size-3 text-[hsl(40_10%_60%)]" />
      <span className="truncate text-[11px] font-medium text-[hsl(40_10%_20%)]">
        {bit.title}
      </span>
    </motion.div>
  );
}

function HierarchyItem({
  item,
  selected,
  onClick,
}: {
  item: HierarchyNode | HierarchyBit;
  selected?: boolean;
  onClick?: () => void;
}) {
  const isNode = 'color' in item;

  if (isNode) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 transition-all border border-transparent",
          selected
            ? "bg-[hsl(40_20%_90%)] border-[hsl(40_10%_80%)] shadow-inner"
            : "hover:bg-white/60 hover:border-[hsl(40_10%_90%)]"
        )}
        style={{ borderRadius: "1px 4px 1px 4px / 4px 1px 4px 1px" }}
      >
        <div
          className="rounded-sm p-1 border"
          style={{ borderColor: `${item.color}30`, color: item.color, background: `linear-gradient(135deg, white 0%, ${item.color}05 100%)` }}
        >
          <Box size={14} />
        </div>
        <span className="flex-1 truncate text-left text-[11px] font-bold text-[hsl(40_10%_25%)]">
          {item.title}
        </span>
        <ChevronRight className={cn("size-3 text-[hsl(40_10%_80%)] transition-transform", selected && "text-[hsl(40_10%_40%)] translate-x-0.5")} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 opacity-70">
      <div className="size-1 bg-[hsl(40_10%_80%)]" />
      <FileText className="size-3 text-[hsl(40_10%_80%)]" />
      <span className="truncate text-[10px] text-[hsl(40_10%_40%)]">
        {item.title}
      </span>
    </div>
  );
}

// --- Main Page Component ---

export default function InboxTriageOrigami() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "Folder A", color: "#4f46e5" },
    { id: "nc2", title: "Archive", color: "#f59e0b" },
  ]);
  const [bitCandidates, setBitCandidates] = useState<BitCandidate[]>([
    { id: "bc1", title: "Verify paper specs" },
    { id: "bc2", title: "Check fold count" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [hierarchyPath, setHierarchyPath] = useState(["home"]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<number, string>>({});

  // Theme effect
  useEffect(() => {
    document.documentElement.dataset.colorTheme = "origami";
    return () => {
      delete document.documentElement.dataset.colorTheme;
    };
  }, []);

  const selectedScratch = scratches.find(s => s.id === selectedScratchId) || scratches[0];

  // --- Handlers ---

  const handleScratchSelect = (id: string) => {
    setSelectedScratchId(id);
  };

  const handleBreakdownFocus = () => {
    setPoolCollapsed(true);
  };

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.trim()) return;
    const idea: Idea = {
      id: `i-${Date.now()}`,
      title: newIdea.trim(),
      createdAt: "just now",
    };
    setIdeas([idea, ...ideas]);
    setNewIdea("");
  };

  const handleRemoveIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id));
  };

  // --- Drag & Drop ---

  const onDragStart = (e: React.DragEvent, id: string, type: string) => {
    e.dataTransfer.setData("id", id);
    e.dataTransfer.setData("type", type);
  };

  const onDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    setDragOverZone(zone);
  };

  const onDropToStaging = (e: React.DragEvent, target: "node" | "bit") => {
    e.preventDefault();
    setDragOverZone(null);
    const id = e.dataTransfer.getData("id");
    const type = e.dataTransfer.getData("type");

    if (type !== "idea") return;
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;

    if (target === "node") {
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, color: "#6366f1" }, ...nodeCandidates]);
    } else {
      setBitCandidates([{ id: `bc-${Date.now()}`, title: idea.title }, ...bitCandidates]);
    }
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const onDropToHierarchy = (e: React.DragEvent, level: number) => {
    e.preventDefault();
    setDragOverZone(null);
    const id = e.dataTransfer.getData("id");
    const type = e.dataTransfer.getData("type");

    if (type === "node-candidate") {
      const node = nodeCandidates.find(n => n.id === id);
      if (node) {
        setPlacedItems({ ...placedItems, [level]: `Node: ${node.title}` });
        setNodeCandidates(nodeCandidates.filter(n => n.id !== id));
      }
    } else if (type === "bit-candidate") {
      const bit = bitCandidates.find(b => b.id === id);
      if (bit) {
        setPlacedItems({ ...placedItems, [level]: `Bit: ${bit.title}` });
        setBitCandidates(bitCandidates.filter(b => b.id !== id));
      }
    }
  };

  const handleNodeClick = (id: string, level: number) => {
    const nextPath = hierarchyPath.slice(0, level + 1);
    nextPath.push(id);
    setHierarchyPath(nextPath);
    setActiveLevel(level + 1);
  };

  // --- Render ---

  return (
    <div className={cn(
      "flex h-screen w-full flex-col p-4 font-mono selection:bg-[hsl(40_20%_80%)]",
      "bg-[hsl(40_20%_95%)] text-[hsl(40_10%_20%)]"
    )} style={{ fontFamily: "var(--font-space-mono), monospace" }}>
      
      {/* App Header */}
      <header 
        className="mb-4 flex h-14 items-center justify-between px-6 border border-[hsl(40_10%_80%)] shadow-sm bg-white"
        style={{ borderRadius: ORIGAMI_RADIUS }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center bg-[hsl(40_20%_95%)] border border-[hsl(40_10%_85%)] text-[hsl(40_10%_40%)]"
               style={{ borderRadius: "4px 10px 4px 10px / 10px 4px 10px 4px" }}>
            <Scissors size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.15em] uppercase text-[hsl(40_10%_20%)]">Origami Triage</h1>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[hsl(40_10%_60%)]">Papercraft Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-[hsl(40_20%_98%)] border border-[hsl(40_10%_85%)]"
               style={{ borderRadius: "10px 2px 10px 2px / 2px 10px 2px 10px" }}>
            <Zap className="size-3 text-[hsl(40_10%_50%)]" />
            <span className="text-[9px] font-bold uppercase tracking-widest">v0.2.1-folded</span>
          </div>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Scratch Pool (Left) */}
        <motion.div
          animate={{ width: poolCollapsed ? 64 : 260 }}
          className="flex shrink-0 flex-col overflow-hidden"
        >
          <PaperPanel intensity="accent" className="flex h-full flex-col overflow-hidden">
            <div className={cn(
              "flex h-12 shrink-0 items-center px-4 border-b border-[hsl(40_10%_80%)]",
              poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-4 px-2" : "justify-between"
            )} style={{ background: "linear-gradient(135deg, hsl(40 20% 92%) 0%, hsl(40 20% 88%) 100%)" }}>
              {!poolCollapsed && (
                <div className="flex items-center gap-2">
                  <Inbox className="size-4 text-[hsl(40_10%_30%)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(40_10%_20%)]">Scratches</span>
                </div>
              )}
              {poolCollapsed && (
                <Inbox className="size-5 text-[hsl(40_10%_40%)]" />
              )}
              <button 
                onClick={() => setPoolCollapsed(!poolCollapsed)}
                className={cn(
                  "flex size-6 items-center justify-center bg-white/40 hover:bg-white/80 border border-[hsl(40_10%_80%)] text-[hsl(40_10%_40%)]",
                  poolCollapsed ? "" : "ml-auto"
                )}
                style={{ borderRadius: "2px 6px 2px 6px / 6px 2px 6px 2px" }}
              >
                {poolCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
              <div className="flex flex-col gap-1.5">
                {scratches.map((scratch) => (
                  <button
                    key={scratch.id}
                    onClick={() => handleScratchSelect(scratch.id)}
                    className={cn(
                      "group relative flex w-full flex-col items-start p-3 text-left transition-all border border-transparent",
                      selectedScratchId === scratch.id
                        ? "bg-white border-[hsl(40_10%_80%)] shadow-sm"
                        : "hover:bg-white/30"
                    )}
                    style={{ borderRadius: "1px 6px 1px 6px / 6px 1px 6px 1px" }}
                  >
                    {!poolCollapsed ? (
                      <>
                        <span className={cn(
                          "truncate text-[11px] font-bold tracking-tight",
                          selectedScratchId === scratch.id ? "text-[hsl(40_10%_20%)]" : "text-[hsl(40_10%_40%)]"
                        )}>
                          {scratch.title}
                        </span>
                        <span className={cn(
                          "mt-1 text-[9px] font-mono uppercase tracking-tighter",
                          selectedScratchId === scratch.id ? "text-[hsl(40_10%_60%)]" : "text-[hsl(40_10%_70%)]"
                        )}>
                          {scratch.createdAt}
                        </span>
                      </>
                    ) : (
                      <div className={cn(
                        "mx-auto size-1.5 rotate-45",
                        selectedScratchId === scratch.id ? "bg-[hsl(40_10%_30%)]" : "bg-[hsl(40_10%_70%)]"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </PaperPanel>
        </motion.div>

        {/* Main Work Area (Right) */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          
          {/* Top Section (60%) */}
          <div className="flex min-h-0 flex-[6] gap-4">
            
            {/* Breakdown / Scribble (60%) */}
            <PaperPanel intensity="light" className="flex flex-[6] flex-col overflow-hidden">
              <FacetedHeader 
                icon={<FileText size={16} />} 
                title="Scribble / Fold" 
                meta={`Ctxt: ${selectedScratch.title.slice(0, 15)}...`}
              />
              
              <div 
                className="flex-1 overflow-y-auto p-4"
                onFocus={handleBreakdownFocus}
              >
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, index) => (
                      <IdeaCard 
                        key={idea.id} 
                        idea={idea} 
                        index={index} 
                        onRemove={handleRemoveIdea}
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-auto p-4 bg-[hsl(40_20%_98%)] border-t border-[hsl(40_10%_90%)]">
                <form onSubmit={handleAddIdea} className="flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(40_10%_70%)]" />
                    <input
                      type="text"
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      onFocus={handleBreakdownFocus}
                      placeholder="Capture a thought..."
                      className="w-full bg-white border border-[hsl(40_10%_85%)] py-2.5 pl-10 pr-4 text-[11px] font-medium text-[hsl(40_10%_20%)] placeholder:italic placeholder:text-[hsl(40_10%_75%)] focus:border-[hsl(40_10%_60%)] focus:outline-none shadow-inner"
                      style={{ borderRadius: "1px 8px 1px 8px / 8px 1px 8px 1px" }}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[hsl(40_10%_30%)] text-[9px] font-bold uppercase tracking-[0.2em] text-white hover:bg-[hsl(40_10%_20%)] transition-colors shadow-sm"
                    style={{ borderRadius: "2px 6px 2px 6px / 6px 2px 6px 2px" }}
                  >
                    Fold
                  </button>
                </form>
              </div>
            </PaperPanel>

            {/* Node / Bit Staging (40%) */}
            <PaperPanel intensity="deep" className="flex flex-[4] flex-col overflow-hidden">
              <FacetedHeader icon={<CircleDot size={16} />} title="Staging" />
              
              <div className="flex h-full min-h-0 gap-3 p-4">
                {/* Node Zone (35%) */}
                <div 
                  className={cn(
                    "flex flex-[35] flex-col p-2 transition-colors bg-white/40 border-2 border-dashed border-[hsl(40_10%_80%)]",
                    dragOverZone === 'node' ? "bg-white border-[hsl(40_10%_60%)]" : ""
                  )}
                  style={{ borderRadius: "4px 12px 4px 12px / 12px 4px 12px 4px" }}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <p className="mb-3 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-[hsl(40_10%_50%)]">Nodes</p>
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {nodeCandidates.map(node => (
                      <NodeCandidateCard 
                        key={node.id} 
                        node={node} 
                        onDragStartCapture={(e) => onDragStart(e, node.id, "node-candidate")}
                      />
                    ))}
                  </div>
                </div>

                {/* Bit Zone (65%) */}
                <div 
                  className={cn(
                    "flex flex-[65] flex-col p-2 transition-colors bg-white/40 border-2 border-dashed border-[hsl(40_10%_80%)]",
                    dragOverZone === 'bit' ? "bg-white border-[hsl(40_10%_60%)]" : ""
                  )}
                  style={{ borderRadius: "4px 12px 4px 12px / 12px 4px 12px 4px" }}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <p className="mb-3 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-[hsl(40_10%_50%)]">Bits</p>
                  <div className="flex flex-col gap-2 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {bitCandidates.map(bit => (
                      <BitCandidateCard 
                        key={bit.id} 
                        bit={bit} 
                        onDragStartCapture={(e) => onDragStart(e, bit.id, "bit-candidate")}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PaperPanel>
          </div>

          {/* Bottom Section (40%) - Hierarchy Explorer */}
          <PaperPanel intensity="light" className="flex min-h-0 flex-[4] flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[hsl(40_10%_90%)] px-4 bg-white/50">
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[hsl(40_10%_50%)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(40_10%_20%)]">Hierarchy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(40_10%_80%)]" />
                  <input 
                    type="text" 
                    placeholder="Search folds..."
                    className="h-7 w-40 bg-white border border-[hsl(40_10%_90%)] pl-8 pr-3 text-[9px] font-medium outline-none focus:border-[hsl(40_10%_70%)]"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div className="flex items-center gap-1 bg-[hsl(40_20%_92%)] border border-[hsl(40_10%_85%)] px-2 py-0.5"
                     style={{ borderRadius: "2px 6px 2px 6px / 6px 2px 6px 2px" }}>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(40_10%_50%)]">H1-L3</span>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-[1px] bg-[hsl(40_10%_90%)]">
              {[0, 1, 2, 3].map((level) => {
                const columnId = level === 0 ? "home" : hierarchyPath[level];
                const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                const isLocked = level > activeLevel;
                const isDragOver = dragOverZone === `hierarchy-${level}`;

                return (
                  <div 
                    key={level}
                    className={cn(
                      "flex flex-col bg-[hsl(40_20%_98%)] p-3 transition-opacity relative",
                      isLocked && "opacity-40",
                      isDragOver && "bg-[hsl(40_20%_92%)]"
                    )}
                    onDragOver={(e) => {
                      if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => {
                      if (!isLocked) onDropToHierarchy(e, level);
                    }}
                  >
                    <header className="mb-3 flex items-center justify-between border-b border-[hsl(40_10%_90%)] pb-1">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[hsl(40_10%_60%)]">
                        {level === 0 ? "Home" : `L${level}`}
                      </span>
                      {activeLevel >= level && !isLocked && (
                        <div className="size-1.5 bg-green-500/40 rounded-full" />
                      )}
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {column.nodes.map(node => (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <HierarchyItem 
                              item={node} 
                              selected={hierarchyPath[level + 1] === node.id}
                              onClick={() => handleNodeClick(node.id, level)}
                            />
                          </motion.div>
                        ))}
                        {column.bits.map(bit => (
                          <motion.div
                            key={bit.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <HierarchyItem item={bit} />
                          </motion.div>
                        ))}
                        
                        {placedItems[level] && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 bg-white border border-[hsl(40_10%_80%)] p-2 shadow-sm"
                            style={{ borderRadius: "1px 6px 1px 6px / 6px 1px 6px 1px" }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] font-bold uppercase text-green-600 tracking-wider">Placed</span>
                              <button onClick={() => {
                                const next = {...placedItems};
                                delete next[level];
                                setPlacedItems(next);
                              }}>
                                <X size={8} className="text-[hsl(40_10%_70%)]" />
                              </button>
                            </div>
                            <p className="truncate text-[9px] font-medium text-[hsl(40_10%_30%)] italic">{placedItems[level]}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && !placedItems[level] && (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center border border-dashed border-[hsl(40_10%_90%)] mt-2">
                          <Plus size={12} className="mb-2 text-[hsl(40_10%_80%)]" />
                          <p className="text-[8px] italic text-[hsl(40_10%_70%)] uppercase tracking-tighter">Crease Here</p>
                        </div>
                      )}
                    </div>

                    {/* Faded fold line between columns */}
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[hsl(40_10%_85%)] to-transparent pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </PaperPanel>
        </div>
      </div>
    </div>
  );
}
