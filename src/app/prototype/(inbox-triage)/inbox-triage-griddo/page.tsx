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
      { id: "work", title: "Work", color: "#3b82f6" },
      { id: "personal", title: "Personal", color: "#6b8e23" },
      { id: "projects", title: "Projects", color: "#4682b4" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "meeting", title: "Meetings", color: "#3b82f6" },
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
      { id: "b-g-1", title: "Refactor theme engine for GridDO Default" },
      { id: "b-g-2", title: "Implement hierarchy explorer prototype" },
    ],
  },
};

// --- Components ---

function GridPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border bg-card text-card-foreground shadow-sm",
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
    <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-primary">
          {icon}
        </span>
        <span className="truncate text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>
      {meta ? (
        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
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
      className="flex aspect-square cursor-grab flex-col items-center justify-center rounded-lg border bg-card p-2 shadow-sm transition-colors hover:border-primary/50"
    >
      <div
        className="mb-1 rounded-md p-1.5"
        style={{ backgroundColor: `${node.color}20`, color: node.color }}
      >
        <Box size={24} />
      </div>
      <span className="w-full truncate text-center text-[10px] font-semibold">
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
      className="flex cursor-grab items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-sm transition-colors hover:border-primary/50"
    >
      <div className="size-1.5 rounded-full bg-primary/40" />
      <FileText className="size-4 text-primary/60" />
      <span className="truncate text-xs font-medium">
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
          "flex w-full items-center gap-2 rounded-md border px-2 py-2 transition-all",
          selected
            ? "border-primary bg-primary/10"
            : "border-transparent hover:border-border hover:bg-muted/50"
        )}
      >
        <div
          className="rounded-md p-1"
          style={{ backgroundColor: `${item.color}20`, color: item.color }}
        >
          <Box size={16} />
        </div>
        <span className="flex-1 truncate text-left text-xs font-semibold">
          {item.title}
        </span>
        <ChevronRight className={cn("size-3 text-muted-foreground/50", selected && "text-primary")} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <div className="size-1.5 rounded-full bg-muted-foreground/30" />
      <FileText className="size-3.5 text-muted-foreground/40" />
      <span className="truncate text-xs text-muted-foreground">
        {item.title}
      </span>
    </div>
  );
}

// --- Main Page Component ---

export default function InboxTriageGridDO() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "Desk Setup", color: "#3b82f6" },
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
    document.documentElement.dataset.colorTheme = "griddo";
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
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, color: "#3b82f6" }, ...nodeCandidates]);
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
    <div className="flex h-screen w-full flex-col bg-background p-4 font-sans selection:bg-primary/20">
      {/* App Header */}
      <header className="mb-4 flex h-14 items-center justify-between rounded-xl border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Layers3 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">GridDO Triage</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Standard Processing</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Default Theme</span>
          </div>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Scratch Pool */}
        <motion.div
          animate={{ width: poolCollapsed ? 64 : 280 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex shrink-0 flex-col overflow-hidden"
        >
          <GridPanel className="flex h-full flex-col overflow-hidden">
            <div className={cn(
              "flex h-12 shrink-0 items-center border-b",
              poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-4 px-2" : "justify-between px-4"
            )}>
              <div className={cn("flex items-center gap-2", poolCollapsed && "flex-col")}>
                <Inbox className={cn("text-primary", poolCollapsed ? "size-5" : "size-4")} />
                {!poolCollapsed && (
                  <>
                    <span className="text-xs font-bold uppercase tracking-wider">Scratch Pool</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {scratches.length}
                    </span>
                  </>
                )}
              </div>
              <button 
                onClick={() => setPoolCollapsed(!poolCollapsed)}
                className={cn(
                  "flex size-6 items-center justify-center rounded-md hover:bg-muted transition-colors",
                  poolCollapsed ? "" : "ml-auto"
                )}
              >
                {poolCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
              <div className="flex flex-col gap-2">
                {scratches.map((scratch) => (
                  <button
                    key={scratch.id}
                    onClick={() => handleScratchSelect(scratch.id)}
                    className={cn(
                      "group relative flex w-full flex-col items-start rounded-md p-3 text-left transition-all",
                      selectedScratchId === scratch.id
                        ? "bg-primary/5 border border-primary/20 shadow-sm"
                        : "hover:bg-muted border border-transparent"
                    )}
                  >
                    {!poolCollapsed ? (
                      <>
                        <span className={cn(
                          "truncate text-sm font-semibold",
                          selectedScratchId === scratch.id ? "text-primary" : "text-foreground"
                        )}>
                          {scratch.title}
                        </span>
                        <span className="mt-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                          {scratch.createdAt}
                        </span>
                      </>
                    ) : (
                      <div className={cn(
                        "mx-auto size-2 rounded-full",
                        selectedScratchId === scratch.id ? "bg-primary" : "bg-muted-foreground/30"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </GridPanel>
        </motion.div>

        {/* Main Work Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          
          {/* Top Section */}
          <div className="flex min-h-0 flex-[6] gap-4">
            
            {/* Breakdown / Scribble */}
            <GridPanel className="flex flex-[6] flex-col overflow-hidden">
              <SectionHeader 
                icon={<FileText size={16} />} 
                title="Breakdown / Scribble" 
                meta={`Context: ${selectedScratch.title}`}
              />
              
              <div 
                className="flex-1 overflow-y-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none"
                onFocus={handleBreakdownFocus}
              >
                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                        className="group flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm hover:border-primary/30 hover:shadow-md cursor-grab active:cursor-grabbing transition-all"
                      >
                        <GripVertical className="size-4 text-muted-foreground/30" />
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium">
                          {idea.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {idea.createdAt}
                        </span>
                        <button 
                          onClick={() => handleRemoveIdea(idea.id)}
                          className="size-7 flex items-center justify-center rounded-full text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-auto border-t p-4 bg-muted/30">
                <form onSubmit={handleAddIdea} className="flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      onFocus={handleBreakdownFocus}
                      placeholder="Scribble another idea..."
                      className="w-full rounded-md border bg-background py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Add
                  </button>
                </form>
              </div>
            </GridPanel>

            {/* Node / Bit Staging - 2 COLUMN */}
            <GridPanel className="flex flex-[4] flex-col overflow-hidden bg-muted/20">
              <SectionHeader icon={<CircleDot size={16} />} title="Staging" />
              
              <div className="flex h-full min-h-0 gap-4 p-4">
                {/* Node Zone */}
                <div 
                  className={cn(
                    "flex flex-1 flex-col rounded-xl border border-dashed p-3 transition-colors",
                    dragOverZone === 'node' ? "bg-primary/5 border-primary" : "bg-card/50 border-muted-foreground/20"
                  )}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nodes</p>
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none pb-2">
                    <AnimatePresence>
                      {nodeCandidates.map(node => (
                        <div 
                          key={node.id} 
                          draggable 
                          onDragStartCapture={(e) => onDragStart(e, node.id, "node-candidate")}
                        >
                          <NodeCandidateCard node={node} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bit Zone */}
                <div 
                  className={cn(
                    "flex flex-1 flex-col rounded-xl border border-dashed p-3 transition-colors",
                    dragOverZone === 'bit' ? "bg-primary/5 border-primary" : "bg-card/50 border-muted-foreground/20"
                  )}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bits</p>
                  <div className="flex flex-col gap-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none pb-2">
                    <AnimatePresence>
                      {bitCandidates.map(bit => (
                        <div 
                          key={bit.id} 
                          draggable 
                          onDragStartCapture={(e) => onDragStart(e, bit.id, "bit-candidate")}
                        >
                          <BitCandidateCard bit={bit} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </GridPanel>
          </div>

          {/* Bottom Section - Hierarchy Explorer */}
          <GridPanel className="flex min-h-0 flex-[4] flex-col overflow-hidden">
            <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">Hierarchy Explorer</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search hierarchy..."
                    className="h-7 w-48 rounded-full border bg-muted/30 pl-8 pr-3 text-[10px] font-medium outline-none focus:bg-background focus:border-primary transition-all"
                  />
                </div>
                <div className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Home-L3</span>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-[1px] bg-border p-[1px]">
              {[0, 1, 2, 3].map((level) => {
                const columnId = level === 0 ? "home" : hierarchyPath[level];
                const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                const isLocked = level > activeLevel;
                const isDragOver = dragOverZone === `hierarchy-${level}`;

                return (
                  <div 
                    key={level}
                    className={cn(
                      "flex flex-col bg-card p-4 transition-all",
                      isLocked && "opacity-40 grayscale-[0.5]",
                      isDragOver && "bg-primary/[0.03]"
                    )}
                    onDragOver={(e) => {
                      if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => {
                      if (!isLocked) onDropToHierarchy(e, level);
                    }}
                  >
                    <header className="mb-4 flex items-center justify-between border-b pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {level === 0 ? "Home" : `Level ${level}`}
                      </span>
                      {activeLevel >= level && !isLocked && (
                        <Check size={10} className="text-primary" />
                      )}
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
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
                            className="mt-2 rounded-lg border border-dashed border-primary bg-primary/5 p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-primary uppercase">Placed!</span>
                              <button 
                                onClick={() => {
                                  const next = {...placedItems};
                                  delete next[level];
                                  setPlacedItems(next);
                                }}
                                className="text-primary hover:bg-primary/10 rounded-full p-0.5"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            <p className="truncate text-xs font-medium text-foreground">{placedItems[level]}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
                          <Plus size={16} className="mb-2 text-muted-foreground/30" />
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Drop to place</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GridPanel>
        </div>
      </div>
    </div>
  );
}
