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
      { id: "work", title: "Work", color: "#8b5e3c" },
      { id: "personal", title: "Personal", color: "#6b8e23" },
      { id: "projects", title: "Projects", color: "#4682b4" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "meeting", title: "Meetings", color: "#8b5e3c" },
      { id: "admin", title: "Admin", color: "#a0522d" },
    ],
    bits: [
      { id: "b-work-1", title: "Reply to project lead's email" },
    ],
  },
  personal: {
    nodes: [
      { id: "health", title: "Health", color: "#2e8b57" },
      { id: "finance", title: "Finance", color: "#daa520" },
    ],
    bits: [
      { id: "b-pers-1", title: "Book dentist appointment" },
    ],
  },
  projects: {
    nodes: [
      { id: "griddo", title: "GridDO Development", color: "#cd853f" },
    ],
    bits: [],
  },
  griddo: {
    nodes: [],
    bits: [
      { id: "b-g-1", title: "Refactor theme engine for Tiny Desk" },
      { id: "b-g-2", title: "Implement hierarchy explorer prototype" },
    ],
  },
};

// --- Components ---

function DeskPanel({
  children,
  className,
  variant = "paper",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "paper" | "cork" | "wood";
}) {
  const bgClass = {
    paper: "bg-[#fdfcf0] border-[#d2c2a4]",
    cork: "bg-[#e5c299] border-[#c4a484]",
    wood: "bg-[#8b5e3c] border-[#5d3a1a]",
  }[variant];

  return (
    <div
      className={cn(
        "rounded-[var(--theme-radius)] border-2 shadow-md",
        bgClass,
        className
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
    <div className="flex h-12 shrink-0 items-center justify-between border-b-2 border-[#d2c2a4]/40 px-4 font-serif">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[#8b5e3c]">
          {icon}
        </span>
        <span className="truncate text-xs font-bold uppercase tracking-wider text-[#5d3a1a]">
          {title}
        </span>
      </div>
      {meta ? (
        <span className="rounded bg-[#d2c2a4]/20 px-2 py-0.5 text-[10px] italic text-[#8b5e3c]">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function NodeCandidateCard({ node }: { node: NodeCandidate }) {
  return (
    <motion.div
      layoutId={node.id}
      whileHover={{ y: -2 }}
      className="flex aspect-square cursor-grab flex-col items-center justify-center rounded-lg border-2 border-[#d2c2a4] bg-white p-2 shadow-sm"
    >
      <div
        className="mb-1 rounded-md p-1.5"
        style={{ backgroundColor: `${node.color}20`, color: node.color }}
      >
        <Box size={24} />
      </div>
      <span className="w-full truncate text-center text-[10px] font-bold text-[#5d3a1a]">
        {node.title}
      </span>
    </motion.div>
  );
}

function BitCandidateCard({ bit }: { bit: BitCandidate }) {
  return (
    <motion.div
      layoutId={bit.id}
      whileHover={{ x: 4 }}
      className="flex cursor-grab items-center gap-2 rounded-md border-2 border-[#d2c2a4] bg-white px-3 py-2 shadow-sm"
    >
      <div className="size-1.5 rounded-full bg-[#8b5e3c]/40" />
      <FileText className="size-4 text-[#8b5e3c]/60" />
      <span className="truncate text-xs font-medium text-[#5d3a1a]">
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
          "flex w-full items-center gap-2 rounded-md border-2 px-2 py-2 transition-all",
          selected
            ? "border-[#8b5e3c] bg-[#8b5e3c]/10"
            : "border-transparent hover:border-[#d2c2a4] hover:bg-white/50"
        )}
      >
        <div
          className="rounded-md p-1"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          <Box size={16} />
        </div>
        <span className="flex-1 truncate text-left text-xs font-bold text-[#5d3a1a]">
          {item.title}
        </span>
        <ChevronRight className={cn("size-3 text-[#d2c2a4]", selected && "text-[#8b5e3c]")} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <div className="size-1.5 rounded-full bg-[#d2c2a4]" />
      <FileText className="size-3.5 text-[#d2c2a4]" />
      <span className="truncate text-xs text-[#5d3a1a]/70">
        {item.title}
      </span>
    </div>
  );
}

// --- Main Page Component ---

export default function InboxTriageTinyDesk() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "Desk Setup", color: "#8b5e3c" },
    { id: "nc2", title: "Office Plan", color: "#6b8e23" },
  ]);
  const [bitCandidates, setBitCandidates] = useState<BitCandidate[]>([
    { id: "bc1", title: "Measure desk width" },
    { id: "bc2", title: "Order cable ties" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [hierarchyPath, setHierarchyPath] = useState(["home"]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<number, string>>({});

  // Theme effect
  useEffect(() => {
    document.documentElement.dataset.colorTheme = "tiny-desk";
    return () => {
      delete document.documentElement.dataset.colorTheme;
    };
  }, []);

  const selectedScratch = scratches.find(s => s.id === selectedScratchId) || scratches[0];

  // --- Handlers ---

  const handleScratchSelect = (id: string) => {
    setSelectedScratchId(id);
    // Decision requirement: When user selects a scratch, pool auto-collapses
    // but we usually wait for focus on breakdown. Let's do it on select for now as a strong signal.
    // Actually the rule says "when the user selects a scratch and focuses breakdown".
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
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, color: "#8b5e3c" }, ...nodeCandidates]);
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
    <div className="flex h-screen w-full flex-col bg-[var(--page-bg)] p-4 font-sans selection:bg-[#8b5e3c]/20">
      {/* App Header */}
      <header className="mb-4 flex h-14 items-center justify-between rounded-xl border-2 border-[#d2c2a4] bg-[#fdfcf0] px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#8b5e3c] text-white shadow-inner">
            <Layers3 size={20} />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold leading-tight text-[#5d3a1a]">Tiny Desk Triage</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b5e3c]/60">Processing Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#d2c2a4] bg-white/50 px-3 py-1.5">
            <div className="size-2 animate-pulse rounded-full bg-[#8b5e3c]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5d3a1a]">Live Prototype</span>
          </div>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Scratch Pool */}
        <motion.div
          animate={{ width: poolCollapsed ? 64 : 280 }}
          className="flex shrink-0 flex-col overflow-hidden"
        >
          <DeskPanel variant="wood" className="flex h-full flex-col overflow-hidden border-[#5d3a1a]">
            <div className={cn(
              "flex h-12 shrink-0 items-center border-b border-[#5d3a1a]/30",
              poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-4 px-2" : "justify-between px-4"
            )}>
              {!poolCollapsed && (
                <div className="flex items-center gap-2">
                  <Inbox className="size-4 text-[#fdfcf0]/80" />
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#fdfcf0]">Scratch Pool</span>
                  <span className="rounded bg-[#fdfcf0]/20 px-1.5 py-0.5 text-[10px] text-[#fdfcf0]">
                    {scratches.length}
                  </span>
                </div>
              )}
              {poolCollapsed && (
                <div className="relative">
                  <Inbox className="size-5 text-[#fdfcf0]/80" />
                  <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#8b5e3c]">
                    {scratches.length}
                  </span>
                </div>
              )}
              <button 
                onClick={() => setPoolCollapsed(!poolCollapsed)}
                className={cn(
                  "flex size-6 items-center justify-center rounded bg-[#fdfcf0]/10 text-[#fdfcf0] hover:bg-[#fdfcf0]/20",
                  !poolCollapsed && "ml-auto"
                )}
              >
                {poolCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="flex flex-col gap-2">
                {scratches.map((scratch) => (
                  <button
                    key={scratch.id}
                    onClick={() => handleScratchSelect(scratch.id)}
                    className={cn(
                      "group relative flex w-full flex-col items-start rounded-md p-3 text-left transition-all",
                      selectedScratchId === scratch.id
                        ? "bg-[#fdfcf0] shadow-md"
                        : "hover:bg-[#fdfcf0]/10"
                    )}
                  >
                    {!poolCollapsed ? (
                      <>
                        <span className={cn(
                          "truncate text-sm font-bold",
                          selectedScratchId === scratch.id ? "text-[#5d3a1a]" : "text-[#fdfcf0]"
                        )}>
                          {scratch.title}
                        </span>
                        <span className={cn(
                          "mt-1 text-[10px] italic",
                          selectedScratchId === scratch.id ? "text-[#8b5e3c]" : "text-[#fdfcf0]/60"
                        )}>
                          {scratch.createdAt}
                        </span>
                      </>
                    ) : (
                      <div className={cn(
                        "mx-auto size-2 rounded-full",
                        selectedScratchId === scratch.id ? "bg-white" : "bg-white/30"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </DeskPanel>
        </motion.div>

        {/* Main Work Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          
          {/* Top Section (60%) */}
          <div className="flex min-h-0 flex-[6] gap-4">
            
            {/* Breakdown / Scribble (60%) */}
            <DeskPanel className="flex flex-[6] flex-col overflow-hidden">
              <SectionHeader 
                icon={<FileText size={16} />} 
                title="Breakdown / Scribble" 
                meta={`Context: ${selectedScratch.title}`}
              />
              
              <div 
                className="flex-1 overflow-y-auto p-4"
                onFocus={handleBreakdownFocus}
              >
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                        className="group flex items-center gap-3 rounded-md border-b border-[#d2c2a4]/20 bg-white/40 p-3 shadow-sm hover:bg-white hover:shadow-md cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="size-4 text-[#d2c2a4]" />
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#8b5e3c]/10 font-serif text-[10px] font-bold text-[#8b5e3c]">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium text-[#5d3a1a]">
                          {idea.title}
                        </span>
                        <span className="text-[10px] italic text-[#8b5e3c]/60">
                          {idea.createdAt}
                        </span>
                        <button 
                          onClick={() => handleRemoveIdea(idea.id)}
                          className="size-7 flex items-center justify-center rounded-full text-[#d2c2a4] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-auto border-t-2 border-[#d2c2a4]/20 p-4">
                <form onSubmit={handleAddIdea} className="flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b5e3c]/40" />
                    <input
                      type="text"
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      onFocus={handleBreakdownFocus}
                      placeholder="Scribble another idea..."
                      className="w-full rounded-md border-2 border-[#d2c2a4] bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-[#5d3a1a] placeholder:italic placeholder:text-[#d2c2a4] focus:border-[#8b5e3c] focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="rounded-md bg-[#8b5e3c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#5d3a1a] transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </form>
              </div>
            </DeskPanel>

            {/* Node / Bit Staging (40%) */}
            <DeskPanel variant="cork" className="flex flex-[4] flex-col overflow-hidden border-[#c4a484]">
              <SectionHeader icon={<CircleDot size={16} />} title="Staging" />
              
              <div className="flex h-full min-h-0 gap-3 p-4">
                {/* Node Zone (35%) */}
                <div 
                  className={cn(
                    "flex flex-[35] flex-col rounded-lg border-2 border-dashed border-[#8b5e3c]/30 p-2 transition-colors",
                    dragOverZone === 'node' ? "bg-white/40 border-[#8b5e3c]" : "bg-[#fdfcf0]/40"
                  )}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#8b5e3c]/60">Nodes</p>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {nodeCandidates.map(node => (
                      <div 
                        key={node.id} 
                        draggable 
                        onDragStartCapture={(e) => onDragStart(e, node.id, "node-candidate")}
                      >
                        <NodeCandidateCard node={node} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bit Zone (65%) */}
                <div 
                  className={cn(
                    "flex flex-[65] flex-col rounded-lg border-2 border-dashed border-[#8b5e3c]/30 p-2 transition-colors",
                    dragOverZone === 'bit' ? "bg-white/40 border-[#8b5e3c]" : "bg-[#fdfcf0]/40"
                  )}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#8b5e3c]/60">Bits</p>
                  <div className="flex flex-col gap-2 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {bitCandidates.map(bit => (
                      <div 
                        key={bit.id} 
                        draggable 
                        onDragStartCapture={(e) => onDragStart(e, bit.id, "bit-candidate")}
                      >
                        <BitCandidateCard bit={bit} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DeskPanel>
          </div>

          {/* Bottom Section (40%) - Hierarchy Explorer */}
          <DeskPanel className="flex min-h-0 flex-[4] flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center justify-between border-b-2 border-[#d2c2a4]/40 px-4">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-[#8b5e3c]" />
                <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#5d3a1a]">Hierarchy Explorer</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#d2c2a4]" />
                  <input 
                    type="text" 
                    placeholder="Search hierarchy..."
                    className="h-7 w-48 rounded-full border border-[#d2c2a4] bg-white pl-8 pr-3 text-[10px] font-medium outline-none focus:border-[#8b5e3c]"
                  />
                </div>
                <div className="flex items-center gap-1 rounded bg-[#d2c2a4]/20 px-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b5e3c]">Home-L3</span>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-0.5 bg-[#d2c2a4]/20 p-0.5">
              {[0, 1, 2, 3].map((level) => {
                const columnId = level === 0 ? "home" : hierarchyPath[level];
                const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                const isLocked = level > activeLevel;
                const isDragOver = dragOverZone === `hierarchy-${level}`;

                return (
                  <div 
                    key={level}
                    className={cn(
                      "flex flex-col bg-[#fdfcf0] p-3 transition-opacity",
                      isLocked && "opacity-40",
                      isDragOver && "bg-[#8b5e3c]/5"
                    )}
                    onDragOver={(e) => {
                      if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => {
                      if (!isLocked) onDropToHierarchy(e, level);
                    }}
                  >
                    <header className="mb-3 flex items-center justify-between border-b border-[#d2c2a4]/40 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5e3c]/60">
                        {level === 0 ? "Home" : `Level ${level}`}
                      </span>
                      {activeLevel >= level && !isLocked && (
                        <Check size={10} className="text-[#6b8e23]" />
                      )}
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {column.nodes.map(node => (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
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
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <HierarchyItem item={bit} />
                          </motion.div>
                        ))}
                        
                        {/* Ghost placement UI */}
                        {placedItems[level] && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 rounded-md border border-dashed border-[#6b8e23] bg-[#6b8e23]/5 p-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#6b8e23]">Placed!</span>
                              <button onClick={() => {
                                const next = {...placedItems};
                                delete next[level];
                                setPlacedItems(next);
                              }}>
                                <X size={10} className="text-[#6b8e23]" />
                              </button>
                            </div>
                            <p className="truncate text-[10px] italic text-[#5d3a1a]">{placedItems[level]}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                          <Plus size={16} className="mb-2 text-[#d2c2a4]" />
                          <p className="text-[10px] italic text-[#d2c2a4]">Drop here to place</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </DeskPanel>
        </div>
      </div>
    </div>
  );
}
