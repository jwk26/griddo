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
  Sparkles,
  MousePointer2,
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
      { id: "work", title: "Work", color: "hsl(340 80% 60%)" },
      { id: "personal", title: "Personal", color: "hsl(200 80% 60%)" },
      { id: "projects", title: "Projects", color: "hsl(150 80% 60%)" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "meeting", title: "Meetings", color: "hsl(340 80% 60%)" },
      { id: "admin", title: "Admin", color: "hsl(340 70% 50%)" },
    ],
    bits: [
      { id: "b-work-1", title: "Reply to project lead's email" },
    ],
  },
  personal: {
    nodes: [
      { id: "health", title: "Health", color: "hsl(200 80% 60%)" },
      { id: "finance", title: "Finance", color: "hsl(200 70% 50%)" },
    ],
    bits: [
      { id: "b-pers-1", title: "Book dentist appointment" },
    ],
  },
  projects: {
    nodes: [
      { id: "griddo", title: "GridDO Development", color: "hsl(150 80% 60%)" },
    ],
    bits: [],
  },
  griddo: {
    nodes: [],
    bits: [
      { id: "b-g-1", title: "Refactor theme engine for Claymorphism" },
      { id: "b-g-2", title: "Implement 3D puffy interactions" },
    ],
  },
};

// --- Claymorphism Components ---

function ClayPanel({
  children,
  className,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[32px] bg-[hsl(340,30%,98%)] transition-all duration-300",
        "shadow-[8px_8px_16px_rgba(0,0,0,0.08),inset_4px_4px_8px_rgba(255,255,255,0.9),inset_-4px_-4px_8px_rgba(0,0,0,0.02)]",
        active && "shadow-[12px_12px_24px_rgba(0,0,0,0.12),inset_6px_6px_12px_rgba(255,255,255,1)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function ClayButton({
  children,
  className,
  variant = "primary",
  onClick,
  type = "button",
  active = false,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "node" | "bit";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  active?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
}) {
  const variants = {
    primary: "bg-[hsl(340,80%,60%)] text-white shadow-[4px_4px_8px_rgba(219,63,123,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1)]",
    secondary: "bg-[hsl(340,30%,90%)] text-[hsl(340,80%,60%)] shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.02)]",
    ghost: "bg-transparent text-[hsl(340,20%,40%)] hover:bg-[hsl(340,30%,95%)]",
    node: "bg-[hsl(340,30%,98%)] text-[hsl(340,80%,60%)] shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9)]",
    bit: "bg-[hsl(340,30%,98%)] text-[hsl(340,20%,40%)] shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-[16px]",
    md: "px-4 py-2 text-sm rounded-[20px]",
    lg: "px-6 py-3 text-base rounded-[24px]",
    icon: "p-2 rounded-full",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0, boxShadow: "inset 4px 4px 8px rgba(0,0,0,0.1)" }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center font-bold transition-all",
        variants[variant],
        sizes[size],
        active && "ring-2 ring-[hsl(340,80%,60%)] ring-offset-2",
        className
      )}
    >
      {children}
    </motion.button>
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
    <div className="flex h-16 shrink-0 items-center justify-between px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[hsl(340,80%,60%)] text-white shadow-[4px_4px_8px_rgba(219,63,123,0.2)]">
          {icon}
        </div>
        <div>
          <span className="block text-sm font-black uppercase tracking-wider text-[hsl(340,20%,30%)]">
            {title}
          </span>
          {meta && (
            <span className="block text-[10px] font-bold text-[hsl(340,20%,60%)]">
              {meta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function InboxTriageClaymorphism() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "Desk Setup", color: "hsl(340, 80%, 60%)" },
    { id: "nc2", title: "Office Plan", color: "hsl(200, 80%, 60%)" },
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
    document.documentElement.dataset.colorTheme = "claymorphism";
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
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, color: "hsl(340, 80%, 60%)" }, ...nodeCandidates]);
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
    <div className="flex h-screen w-full flex-col bg-[hsl(340,30%,95%)] p-6 font-sans selection:bg-[hsl(340,80%,60%,0.2)]">
      {/* App Header */}
      <header className="mb-6 flex h-20 shrink-0 items-center justify-between rounded-[32px] bg-[hsl(340,30%,98%)] px-8 shadow-[8px_8px_16px_rgba(0,0,0,0.05),inset_4px_4px_8px_rgba(255,255,255,0.9)]">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-[hsl(340,80%,60%)] text-white shadow-[4px_4px_12px_rgba(219,63,123,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)]">
            <Layers3 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[hsl(340,20%,30%)]">Clay Inbox</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(340,80%,60%)] opacity-70">3D Triage Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-full bg-[hsl(340,30%,94%)] px-4 py-2 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
            <div className="size-2 animate-pulse rounded-full bg-[hsl(340,80%,60%)]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[hsl(340,20%,40%)]">Prototype v2</span>
          </div>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* Scratch Pool */}
        <motion.div
          animate={{ width: poolCollapsed ? 100 : 320 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="flex shrink-0 flex-col"
        >
          <ClayPanel className="flex h-full flex-col overflow-hidden">
            <div className={cn(
              "flex shrink-0 items-center transition-all",
              poolCollapsed ? "flex-col justify-center gap-3 py-6 px-4" : "h-16 justify-between px-6"
            )}>
              {!poolCollapsed && (
                <div className="flex items-center gap-2">
                  <Inbox className="size-5 text-[hsl(340,80%,60%)]" />
                  <span className="text-sm font-black uppercase tracking-wider text-[hsl(340,20%,30%)]">Scratches</span>
                </div>
              )}
              {poolCollapsed && (
                <div className="relative">
                  <Inbox className="size-7 text-[hsl(340,80%,60%)]" />
                  <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-[hsl(340,80%,60%)] text-[10px] font-black text-white shadow-md">
                    {scratches.length}
                  </span>
                </div>
              )}
              <ClayButton 
                size="icon" 
                variant="secondary"
                onClick={() => setPoolCollapsed(!poolCollapsed)}
                className={cn(!poolCollapsed && "ml-2")}
              >
                {poolCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </ClayButton>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {scratches.map((scratch) => (
                  <motion.button
                    key={scratch.id}
                    layout
                    onClick={() => handleScratchSelect(scratch.id)}
                    className={cn(
                      "group relative flex w-full flex-col items-start rounded-[24px] p-4 text-left transition-all",
                      selectedScratchId === scratch.id
                        ? "bg-[hsl(340,80%,60%)] text-white shadow-[4px_4px_12px_rgba(219,63,123,0.3),inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                        : "bg-[hsl(340,30%,95%)] text-[hsl(340,20%,40%)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)] hover:bg-[hsl(340,30%,92%)]"
                    )}
                  >
                    {!poolCollapsed ? (
                      <>
                        <span className="text-sm font-bold truncate w-full">
                          {scratch.title}
                        </span>
                        <span className={cn(
                          "mt-1 text-[10px] font-bold opacity-60",
                          selectedScratchId === scratch.id ? "text-white" : "text-[hsl(340,20%,50%)]"
                        )}>
                          {scratch.createdAt}
                        </span>
                      </>
                    ) : (
                      <div className={cn(
                        "mx-auto size-3 rounded-full",
                        selectedScratchId === scratch.id ? "bg-white" : "bg-[hsl(340,80%,60%,0.3)]"
                      )} />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </ClayPanel>
        </motion.div>

        {/* Main Work Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          
          {/* Top Section (60%) */}
          <div className="flex min-h-0 flex-[6] gap-6">
            
            {/* Breakdown / Scribble (60%) */}
            <ClayPanel className="flex flex-[6] flex-col overflow-hidden">
              <SectionHeader 
                icon={<FileText size={20} />} 
                title="Breakdown" 
                meta={selectedScratch.title}
              />
              
              <div 
                className="flex-1 overflow-y-auto p-6"
                onFocus={handleBreakdownFocus}
              >
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                        className="group flex items-center gap-4 rounded-[24px] bg-[hsl(340,30%,98%)] p-4 shadow-[4px_4px_8px_rgba(0,0,0,0.04),inset_2px_2px_4px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.08)] cursor-grab active:cursor-grabbing transition-all"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[hsl(340,80%,60%,0.1)] text-[hsl(340,80%,60%)]">
                          <GripVertical size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[hsl(340,20%,30%)]">
                            {idea.title}
                          </p>
                        </div>
                        <ClayButton
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveIdea(idea.id)}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </ClayButton>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-auto p-6 bg-[hsl(340,30%,96%)] rounded-b-[32px]">
                <form onSubmit={handleAddIdea} className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      onFocus={handleBreakdownFocus}
                      placeholder="Catch another thought..."
                      className="w-full rounded-[20px] bg-[hsl(340,30%,98%)] py-3 px-6 text-sm font-bold text-[hsl(340,20%,30%)] placeholder:text-[hsl(340,10%,70%)] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.04)] outline-none focus:ring-2 focus:ring-[hsl(340,80%,60%,0.3)]"
                    />
                  </div>
                  <ClayButton type="submit">
                    <Plus size={18} className="mr-1" /> Add
                  </ClayButton>
                </form>
              </div>
            </ClayPanel>

            {/* Node / Bit Staging (40%) */}
            <ClayPanel className="flex flex-[4] flex-col overflow-hidden !bg-[hsl(200,30%,98%)]">
              <SectionHeader 
                icon={<Sparkles size={20} />} 
                title="Staging" 
              />
              
              <div className="flex h-full min-h-0 gap-4 p-6 pt-0">
                {/* Node Zone (35%) */}
                <div 
                  className={cn(
                    "flex flex-[35] flex-col rounded-[24px] p-3 transition-all",
                    dragOverZone === 'node' ? "bg-[hsl(200,80%,60%,0.1)] scale-[1.02]" : "bg-[hsl(200,30%,95%)]"
                  )}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-[hsl(200,80%,40%)] opacity-60">Nodes</p>
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {nodeCandidates.map(node => (
                      <motion.div 
                        key={node.id} 
                        draggable 
                        whileHover={{ scale: 1.05 }}
                        onDragStartCapture={(e) => onDragStart(e, node.id, "node-candidate")}
                        className="flex aspect-square flex-col items-center justify-center rounded-[20px] bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9)] cursor-grab"
                      >
                        <div className="mb-1 p-2 rounded-2xl bg-[hsl(340,80%,60%,0.1)] text-[hsl(340,80%,60%)]">
                          <Box size={24} />
                        </div>
                        <span className="px-2 text-center text-[9px] font-black leading-tight text-[hsl(340,20%,40%)] truncate w-full">
                          {node.title}
                        </span>
                      </motion.div>
                    ))}
                    {nodeCandidates.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center border-2 border-dashed border-[hsl(200,80%,60%,0.2)] rounded-[20px] p-4 text-center opacity-40">
                        <MousePointer2 size={16} className="mb-1" />
                        <span className="text-[8px] font-black uppercase">Drop Idea</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bit Zone (65%) */}
                <div 
                  className={cn(
                    "flex flex-[65] flex-col rounded-[24px] p-3 transition-all",
                    dragOverZone === 'bit' ? "bg-[hsl(150,80%,60%,0.1)] scale-[1.02]" : "bg-[hsl(150,30%,95%)]"
                  )}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-[hsl(150,80%,40%)] opacity-60">Bits</p>
                  <div className="flex flex-col gap-3 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {bitCandidates.map(bit => (
                      <motion.div 
                        key={bit.id} 
                        draggable 
                        whileHover={{ x: 5 }}
                        onDragStartCapture={(e) => onDragStart(e, bit.id, "bit-candidate")}
                        className="flex items-center gap-3 rounded-[16px] bg-white p-3 shadow-[4px_4px_8px_rgba(0,0,0,0.05),inset_2px_2px_4px_rgba(255,255,255,0.9)] cursor-grab"
                      >
                        <div className="size-2 rounded-full bg-[hsl(150,80%,60%)] shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="truncate text-xs font-bold text-[hsl(340,20%,30%)]">
                          {bit.title}
                        </span>
                      </motion.div>
                    ))}
                    {bitCandidates.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center border-2 border-dashed border-[hsl(150,80%,60%,0.2)] rounded-[20px] p-4 text-center opacity-40">
                        <MousePointer2 size={16} className="mb-1" />
                        <span className="text-[8px] font-black uppercase">Drop Idea</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ClayPanel>
          </div>

          {/* Bottom Section (40%) - Hierarchy Explorer */}
          <ClayPanel className="flex min-h-0 flex-[4] flex-col overflow-hidden">
            <div className="flex h-16 shrink-0 items-center justify-between px-8 border-b border-[hsl(340,30%,92%)]">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-[hsl(340,80%,60%)]" />
                <span className="text-sm font-black uppercase tracking-wider text-[hsl(340,20%,30%)]">Hierarchy</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(340,10%,70%)]" />
                  <input 
                    type="text" 
                    placeholder="Find in hierarchy..."
                    className="h-10 w-64 rounded-full bg-[hsl(340,30%,95%)] pl-10 pr-4 text-[11px] font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)] outline-none focus:ring-2 focus:ring-[hsl(340,80%,60%,0.2)]"
                  />
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-4 gap-4 p-6 bg-[hsl(340,30%,96%)]">
              {[0, 1, 2, 3].map((level) => {
                const columnId = level === 0 ? "home" : hierarchyPath[level];
                const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                const isLocked = level > activeLevel;
                const isDragOver = dragOverZone === `hierarchy-${level}`;

                return (
                  <motion.div 
                    key={level}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: isLocked ? 0.5 : 1, 
                      scale: 1,
                      backgroundColor: isDragOver ? "hsl(340,80%,60%,0.05)" : "hsl(340,30%,98%)"
                    }}
                    className={cn(
                      "flex flex-col rounded-[24px] p-4 shadow-[4px_4px_8px_rgba(0,0,0,0.03),inset_2px_2px_4px_rgba(255,255,255,0.9)] overflow-hidden",
                      isLocked && "pointer-events-none"
                    )}
                    onDragOver={(e) => {
                      if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => {
                      if (!isLocked) onDropToHierarchy(e, level);
                    }}
                  >
                    <header className="mb-4 flex items-center justify-between border-b border-[hsl(340,30%,92%)] pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(340,80%,60%)] opacity-60">
                        {level === 0 ? "Home" : `L${level}`}
                      </span>
                      {activeLevel >= level && !isLocked && (
                        <Check size={12} className="text-green-500" />
                      )}
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                      <AnimatePresence initial={false}>
                        {column.nodes.map(node => (
                          <motion.button
                            key={node.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNodeClick(node.id, level)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-[16px] p-3 text-left transition-all",
                              hierarchyPath[level + 1] === node.id
                                ? "bg-[hsl(340,80%,60%)] text-white shadow-[4px_4px_8px_rgba(219,63,123,0.3)]"
                                : "bg-white text-[hsl(340,20%,30%)] shadow-[2px_2px_4px_rgba(0,0,0,0.02)]"
                            )}
                          >
                            <Box size={14} className={hierarchyPath[level + 1] === node.id ? "text-white" : "text-[hsl(340,80%,60%)]"} />
                            <span className="flex-1 truncate text-[11px] font-black uppercase tracking-wide">
                              {node.title}
                            </span>
                            <ChevronRight size={12} className="opacity-40" />
                          </motion.button>
                        ))}
                        {column.bits.map(bit => (
                          <div
                            key={bit.id}
                            className="flex items-center gap-3 rounded-[16px] bg-white/60 p-3 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)]"
                          >
                            <FileText size={14} className="text-[hsl(340,10%,70%)]" />
                            <span className="truncate text-[11px] font-bold text-[hsl(340,20%,40%)]">
                              {bit.title}
                            </span>
                          </div>
                        ))}
                        
                        {/* Ghost placement UI */}
                        {placedItems[level] && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 rounded-[16px] bg-green-50 border-2 border-dashed border-green-200 p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black text-green-600 uppercase">Placed!</span>
                              <button onClick={() => {
                                const next = {...placedItems};
                                delete next[level];
                                setPlacedItems(next);
                              }}>
                                <X size={12} className="text-green-400" />
                              </button>
                            </div>
                            <p className="truncate text-[10px] font-bold text-green-800/60 italic">{placedItems[level]}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center opacity-30">
                          <Plus size={20} className="mb-2" />
                          <p className="text-[9px] font-black uppercase tracking-tighter">Drop here</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ClayPanel>
        </div>
      </div>
    </div>
  );
}
