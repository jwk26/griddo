"use client";

import { useEffect, useState } from "react";
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
      { id: "work", title: "Work", color: "#27272a" },
      { id: "personal", title: "Personal", color: "#52525b" },
      { id: "projects", title: "Projects", color: "#71717a" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "meeting", title: "Meetings", color: "#27272a" },
      { id: "admin", title: "Admin", color: "#3f3f46" },
    ],
    bits: [
      { id: "b-work-1", title: "Reply to project lead's email" },
    ],
  },
  personal: {
    nodes: [
      { id: "health", title: "Health", color: "#27272a" },
      { id: "finance", title: "Finance", color: "#52525b" },
    ],
    bits: [
      { id: "b-pers-1", title: "Book dentist appointment" },
    ],
  },
  projects: {
    nodes: [
      { id: "griddo", title: "GridDO Development", color: "#18181b" },
    ],
    bits: [],
  },
  griddo: {
    nodes: [],
    bits: [
      { id: "b-g-1", title: "Refactor theme engine for Graphite" },
      { id: "b-g-2", title: "Implement hierarchy explorer prototype" },
    ],
  },
};

// --- Components ---

function GraphitePanel({
  children,
  className,
  variant = "base",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "base" | "subtle" | "dark";
}) {
  const bgClass = {
    base: "bg-white border-zinc-200",
    subtle: "bg-zinc-50 border-zinc-200",
    dark: "bg-zinc-900 border-zinc-800 text-white",
  }[variant];

  return (
    <div
      className={cn(
        "rounded-[8px] border-2 shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-colors duration-300",
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
  dark = false,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn(
      "flex h-12 shrink-0 items-center justify-between border-b-2 px-4 font-sans tracking-tight",
      dark ? "border-zinc-800" : "border-zinc-100"
    )}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={cn(dark ? "text-zinc-400" : "text-zinc-500")}>
          {icon}
        </span>
        <span className={cn(
          "truncate text-xs font-semibold uppercase tracking-widest",
          dark ? "text-zinc-100" : "text-zinc-900"
        )}>
          {title}
        </span>
      </div>
      {meta ? (
        <span className={cn(
          "rounded px-2 py-0.5 text-[10px] font-medium tracking-wide",
          dark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
        )}>
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
      whileHover={{ y: -2, borderColor: "#18181b" }}
      className="flex aspect-square cursor-grab flex-col items-center justify-center rounded-lg border-2 border-zinc-200 bg-white p-2 shadow-sm transition-colors"
    >
      <div
        className="mb-1 rounded-md p-1.5 text-zinc-900"
      >
        <Box size={24} strokeWidth={1.5} />
      </div>
      <span className="w-full truncate text-center text-[10px] font-bold text-zinc-900">
        {node.title}
      </span>
    </motion.div>
  );
}

function BitCandidateCard({ bit }: { bit: BitCandidate }) {
  return (
    <motion.div
      layoutId={bit.id}
      whileHover={{ x: 4, borderColor: "#18181b" }}
      className="flex cursor-grab items-center gap-3 rounded-md border-2 border-zinc-200 bg-white px-3 py-2.5 shadow-sm transition-colors"
    >
      <FileText className="size-4 text-zinc-400" strokeWidth={1.5} />
      <span className="truncate text-xs font-medium text-zinc-900">
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
          "group flex w-full items-center gap-3 rounded-md border-2 px-3 py-2 transition-all",
          selected
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"
        )}
      >
        <Box size={16} strokeWidth={selected ? 2 : 1.5} />
        <span className="flex-1 truncate text-left text-xs font-bold tracking-tight">
          {item.title}
        </span>
        <ChevronRight className={cn("size-3 transition-transform", selected ? "text-white" : "text-zinc-300 group-hover:translate-x-0.5")} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 text-zinc-500">
      <FileText className="size-3.5" strokeWidth={1.5} />
      <span className="truncate text-xs font-medium">
        {item.title}
      </span>
    </div>
  );
}

// --- Main Page Component ---

export default function InboxTriageGraphite() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "Architecture", color: "#18181b" },
    { id: "nc2", title: "Minimalist", color: "#3f3f46" },
  ]);
  const [bitCandidates, setBitCandidates] = useState<BitCandidate[]>([
    { id: "bc1", title: "Define grid system" },
    { id: "bc2", title: "Select font pairings" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [hierarchyPath, setHierarchyPath] = useState(["home"]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<number, string>>({});

  // Theme effect
  useEffect(() => {
    document.documentElement.dataset.colorTheme = "graphite";
    document.body.style.fontFamily = "var(--font-inter), sans-serif";
    return () => {
      delete document.documentElement.dataset.colorTheme;
      document.body.style.fontFamily = "";
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
      createdAt: "now",
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
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, color: "#18181b" }, ...nodeCandidates]);
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
    <div className="flex h-screen w-full flex-col bg-zinc-50 p-6 font-sans selection:bg-zinc-900 selection:text-white">
      {/* App Header */}
      <header className="mb-6 flex h-16 items-center justify-between rounded-[8px] border-2 border-zinc-900 bg-white px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded bg-zinc-900 text-white">
            <Layers3 size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-zinc-900">GRAPHITE</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Triage System v2</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-zinc-900 rounded font-bold text-[10px] uppercase tracking-widest text-zinc-900">
            <div className="size-1.5 bg-zinc-900 rounded-full animate-pulse" />
            Stable Build
          </div>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* Scratch Pool */}
        <motion.div
          animate={{ width: poolCollapsed ? 72 : 300 }}
          className="flex shrink-0 flex-col overflow-hidden"
        >
          <GraphitePanel variant="dark" className="flex h-full flex-col overflow-hidden">
            <div className={cn(
              "flex h-12 shrink-0 items-center border-b-2 border-zinc-800 px-4",
              poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-4 px-2" : "justify-between"
            )}>
              {!poolCollapsed && (
                <div className="flex items-center gap-2.5">
                  <Inbox className="size-4 text-zinc-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Pool</span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                    {scratches.length}
                  </span>
                </div>
              )}
              {poolCollapsed && (
                <Inbox className="size-5 text-zinc-400" />
              )}
              <button 
                onClick={() => setPoolCollapsed(!poolCollapsed)}
                className={cn(
                  "flex size-6 items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 transition-colors",
                  poolCollapsed ? "" : "ml-auto"
                )}
              >
                {poolCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-2">
                {scratches.map((scratch) => (
                  <button
                    key={scratch.id}
                    onClick={() => handleScratchSelect(scratch.id)}
                    className={cn(
                      "group relative flex w-full flex-col items-start rounded p-4 text-left transition-all border-2",
                      selectedScratchId === scratch.id
                        ? "bg-zinc-800 border-zinc-700"
                        : "border-transparent hover:bg-zinc-800/50"
                    )}
                  >
                    {!poolCollapsed ? (
                      <>
                        <span className={cn(
                          "truncate text-sm font-bold tracking-tight",
                          selectedScratchId === scratch.id ? "text-white" : "text-zinc-400"
                        )}>
                          {scratch.title}
                        </span>
                        <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                          {scratch.createdAt}
                        </span>
                      </>
                    ) : (
                      <div className={cn(
                        "mx-auto size-1.5 rounded-full",
                        selectedScratchId === scratch.id ? "bg-white" : "bg-zinc-700"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </GraphitePanel>
        </motion.div>

        {/* Main Work Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          
          {/* Top Section (60%) */}
          <div className="flex min-h-0 flex-[6] gap-6">
            
            {/* Breakdown / Scribble (60%) */}
            <GraphitePanel className="flex flex-[6] flex-col overflow-hidden">
              <SectionHeader 
                icon={<FileText size={16} strokeWidth={1.5} />} 
                title="Breakdown" 
                meta={`Ref: ${selectedScratch.title}`}
              />
              
              <div 
                className="flex-1 overflow-y-auto p-6"
                onFocus={handleBreakdownFocus}
              >
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                        className="group flex items-center gap-4 rounded-md border-2 border-transparent bg-zinc-50 p-4 hover:bg-white hover:border-zinc-900 hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
                      >
                        <GripVertical className="size-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                        <span className="flex-1 text-sm font-bold tracking-tight text-zinc-900">
                          {idea.title}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          #{index + 1}
                        </span>
                        <button 
                          onClick={() => handleRemoveIdea(idea.id)}
                          className="size-8 flex items-center justify-center rounded text-zinc-300 hover:bg-zinc-900 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-auto border-t-2 border-zinc-100 p-6 bg-zinc-50/50">
                <form onSubmit={handleAddIdea} className="flex gap-3">
                  <div className="relative flex-1">
                    <Plus className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      onFocus={handleBreakdownFocus}
                      placeholder="NEW scribbled thought..."
                      className="w-full rounded border-2 border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="rounded bg-zinc-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-black transition-colors shadow-sm"
                  >
                    APPEND
                  </button>
                </form>
              </div>
            </GraphitePanel>

            {/* Node / Bit Staging (40%) */}
            <GraphitePanel variant="subtle" className="flex flex-[4] flex-col overflow-hidden">
              <SectionHeader icon={<CircleDot size={16} />} title="Staging" />
              
              <div className="flex h-full min-h-0 gap-4 p-6">
                {/* Node Zone (35%) */}
                <div 
                  className={cn(
                    "flex flex-[35] flex-col rounded-lg border-2 border-dashed transition-all p-3",
                    dragOverZone === 'node' ? "bg-white border-zinc-900" : "bg-transparent border-zinc-200"
                  )}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Nodes</p>
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
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
                    "flex flex-[65] flex-col rounded-lg border-2 border-dashed transition-all p-3",
                    dragOverZone === 'bit' ? "bg-white border-zinc-900" : "bg-transparent border-zinc-200"
                  )}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Bits</p>
                  <div className="flex flex-col gap-3 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
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
            </GraphitePanel>
          </div>

          {/* Bottom Section (40%) - Hierarchy Explorer */}
          <GraphitePanel className="flex min-h-0 flex-[4] flex-col overflow-hidden">
            <div className="flex h-14 shrink-0 items-center justify-between border-b-2 border-zinc-100 px-6">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-zinc-900" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">Hierarchy Explorer</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Quick search..."
                    className="h-9 w-64 rounded border-2 border-zinc-100 bg-zinc-50 pl-10 pr-4 text-[10px] font-bold tracking-wide outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">System Path</span>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-0.5 bg-zinc-100 p-0.5">
              {[0, 1, 2, 3].map((level) => {
                const columnId = level === 0 ? "home" : hierarchyPath[level];
                const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                const isLocked = level > activeLevel;
                const isDragOver = dragOverZone === `hierarchy-${level}`;

                return (
                  <div 
                    key={level}
                    className={cn(
                      "flex flex-col bg-white p-5 transition-all",
                      isLocked && "opacity-40 grayscale",
                      isDragOver && "bg-zinc-50 ring-2 ring-inset ring-zinc-900"
                    )}
                    onDragOver={(e) => {
                      if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => {
                      if (!isLocked) onDropToHierarchy(e, level);
                    }}
                  >
                    <header className="mb-4 flex items-center justify-between border-b-2 border-zinc-50 pb-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        {level === 0 ? "Root" : `L${level}`}
                      </span>
                      {activeLevel >= level && !isLocked && (
                        <Check size={12} strokeWidth={3} className="text-zinc-900" />
                      )}
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
                      <AnimatePresence initial={false}>
                        {column.nodes.map(node => (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
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
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <HierarchyItem item={bit} />
                          </motion.div>
                        ))}
                        
                        {/* Ghost placement UI */}
                        {placedItems[level] && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-3 rounded border-2 border-dashed border-zinc-900 bg-zinc-50 p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">Captured</span>
                              <button onClick={() => {
                                const next = {...placedItems};
                                delete next[level];
                                setPlacedItems(next);
                              }}>
                                <X size={12} strokeWidth={2.5} className="text-zinc-900" />
                              </button>
                            </div>
                            <p className="truncate text-[10px] font-bold text-zinc-600">{placedItems[level]}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center border-2 border-dashed border-zinc-100 rounded-lg">
                          <Plus size={20} strokeWidth={1} className="mb-2 text-zinc-200" />
                          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">Target Zone</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GraphitePanel>
        </div>
      </div>
    </div>
  );
}
