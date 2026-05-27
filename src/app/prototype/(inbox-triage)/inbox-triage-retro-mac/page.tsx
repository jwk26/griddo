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
  Monitor,
  Folder,
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
  icon: any;
};

type BitCandidate = {
  id: string;
  title: string;
};

type HierarchyNode = {
  id: string;
  title: string;
  icon: any;
};

type HierarchyBit = {
  id: string;
  title: string;
};

// --- Mock Data ---

const scratchesSeed: Scratch[] = [
  { id: "s1", title: "Project 'Lisa' architecture notes", createdAt: "2h ago" },
  { id: "s2", title: "System 7 UI refinement ideas", createdAt: "yesterday" },
  { id: "s3", title: "HyperCard stack brainstorming", createdAt: "2 days ago" },
  { id: "s4", title: "MFS to HFS migration plan", createdAt: "6 days ago" },
  { id: "s5", title: "QuickDraw optimization tasks", createdAt: "05/04/26" },
];

const ideasSeed: Idea[] = [
  { id: "i1", title: "Implement pixel-perfect window dragging", createdAt: "10m ago" },
  { id: "i2", title: "Add support for 1-bit patterns", createdAt: "7m ago" },
  { id: "i3", title: "Design custom icon set for Triage", createdAt: "4m ago" },
];

const hierarchyData: Record<string, { nodes: HierarchyNode[]; bits: HierarchyBit[] }> = {
  home: {
    nodes: [
      { id: "system", title: "System Folder", icon: Monitor },
      { id: "apps", title: "Applications", icon: Layers3 },
      { id: "docs", title: "Documents", icon: Folder },
    ],
    bits: [],
  },
  system: {
    nodes: [
      { id: "extensions", title: "Extensions", icon: Folder },
      { id: "control-panels", title: "Control Panels", icon: Folder },
    ],
    bits: [
      { id: "b-sys-1", title: "Finder 7.0" },
    ],
  },
  apps: {
    nodes: [
      { id: "macpaint", title: "MacPaint", icon: Layers3 },
      { id: "macwrite", title: "MacWrite", icon: Layers3 },
    ],
    bits: [
      { id: "b-app-1", title: "HyperCard 2.1" },
    ],
  },
  docs: {
    nodes: [
      { id: "archive", title: "Archive", icon: Folder },
    ],
    bits: [
      { id: "b-doc-1", title: "Quarterly Report.txt" },
      { id: "b-doc-2", title: "Draft Notes.txt" },
    ],
  },
};

// --- Retro Mac Components ---

const MAC_BORDER = "border-2 border-black";
const MAC_SHADOW = "shadow-[2px_2px_0px_#000]";
const MAC_RADIUS = "rounded-[4px]";

function MacWindow({
  children,
  className,
  variant = "window",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "window" | "panel" | "inset";
}) {
  const bgClass = variant === "inset" ? "bg-white" : "bg-[hsl(0,0%,90%)]";
  
  return (
    <div
      className={cn(
        MAC_RADIUS,
        MAC_BORDER,
        variant !== "inset" && MAC_SHADOW,
        bgClass,
        className
      )}
    >
      {children}
    </div>
  );
}

function MacHeader({
  title,
  showClose = true,
  onClose,
  className,
}: {
  title: string;
  showClose?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("relative flex h-6 shrink-0 items-center border-b-2 border-black px-2", className)}>
      {/* Stripes Pattern */}
      <div 
        className="absolute inset-x-0 inset-y-0.5 pointer-events-none opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 4px)`
        }}
      />
      
      <div className="relative z-10 flex w-full items-center justify-between">
        {showClose && (
          <button 
            onClick={onClose}
            className="flex size-4 items-center justify-center border border-black bg-white active:bg-black active:text-white"
          >
            <X size={10} strokeWidth={3} />
          </button>
        )}
        <span className="mx-auto text-[10px] font-bold uppercase tracking-widest text-black bg-[hsl(0,0%,90%)] px-2">
          {title}
        </span>
        {showClose && <div className="size-4" />}
      </div>
    </div>
  );
}

function MacButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        MAC_RADIUS,
        "border-2 border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black active:bg-black active:text-white disabled:opacity-50 transition-colors",
        MAC_SHADOW,
        className
      )}
    >
      {children}
    </button>
  );
}

// --- Main Page Component ---

export default function InboxTriageRetroMac() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "System Setup", icon: Monitor },
    { id: "nc2", title: "App Layout", icon: Layers3 },
  ]);
  const [bitCandidates, setBitCandidates] = useState<BitCandidate[]>([
    { id: "bc1", title: "Configure AppleTalk" },
    { id: "bc2", title: "Adjust mouse speed" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [hierarchyPath, setHierarchyPath] = useState(["home"]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<number, string>>({});

  // Theme effect
  useEffect(() => {
    document.documentElement.dataset.colorTheme = "retro-mac";
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
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, icon: Monitor }, ...nodeCandidates]);
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
    <div className="flex h-screen w-full flex-col bg-[#556677] p-4 font-mono selection:bg-black selection:text-white" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
      
      {/* App Header (Desktop Menu Bar style) */}
      <header className="mb-4 flex h-8 items-center justify-between border-2 border-black bg-white px-4 shadow-[2px_2px_0px_#000] rounded-[4px]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Monitor size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-wider">File</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">Edit</span>
          <span className="text-[11px] font-bold uppercase tracking-wider">View</span>
          <span className="text-[11px] font-bold uppercase tracking-wider">Label</span>
          <span className="text-[11px] font-bold uppercase tracking-wider">Special</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold">12:00 PM</span>
        </div>
      </header>

      {/* Workspace Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Scratch Pool */}
        <motion.div
          animate={{ width: poolCollapsed ? 48 : 260 }}
          className="flex shrink-0 flex-col overflow-hidden"
        >
          <MacWindow className="flex h-full flex-col overflow-hidden">
            <div className={cn(
              "flex shrink-0 items-center border-b-2 border-black relative",
              poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-4 px-2 bg-white" : "h-6 px-2"
            )}>
              {!poolCollapsed && (
                <>
                  <div 
                    className="absolute inset-x-0 inset-y-0.5 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 4px)`
                    }}
                  />
                  <div className="relative z-10 flex w-full items-center justify-between">
                    <button 
                      onClick={() => setPoolCollapsed(true)}
                      className="flex size-4 items-center justify-center border border-black bg-white active:bg-black active:text-white"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                    <span className="mx-auto text-[10px] font-bold uppercase tracking-widest text-black bg-[hsl(0,0%,90%)] px-2">
                      Scratch Pool
                    </span>
                    <div className="size-4" />
                  </div>
                </>
              )}
              {poolCollapsed && (
                <>
                  <div className="relative">
                    <Inbox size={18} />
                    <span className="absolute -right-2 -top-2 flex size-3.5 items-center justify-center border border-black bg-white text-[8px] font-bold">
                      {scratches.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setPoolCollapsed(false)}
                    className="flex size-6 items-center justify-center border border-black hover:bg-black hover:text-white shadow-[1px_1px_0px_#000]"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
              <div className="flex flex-col gap-1">
                {scratches.map((scratch) => (
                  <button
                    key={scratch.id}
                    onClick={() => handleScratchSelect(scratch.id)}
                    className={cn(
                      "group relative flex w-full flex-col items-start px-2 py-2 text-left",
                      selectedScratchId === scratch.id
                        ? "bg-black text-white"
                        : "hover:bg-black/10"
                    )}
                  >
                    {!poolCollapsed ? (
                      <>
                        <span className="truncate text-[11px] font-bold uppercase tracking-tight">
                          {scratch.title}
                        </span>
                        <span className={cn(
                          "mt-0.5 text-[9px]",
                          selectedScratchId === scratch.id ? "text-white/70" : "text-black/50"
                        )}>
                          {scratch.createdAt}
                        </span>
                      </>
                    ) : (
                      <div className={cn(
                        "mx-auto size-2 border border-black",
                        selectedScratchId === scratch.id ? "bg-white" : "bg-black"
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </MacWindow>
        </motion.div>

        {/* Main Work Area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          
          {/* Top Section (60%) */}
          <div className="flex min-h-0 flex-[6] gap-4">
            
            {/* Breakdown / Scribble (60%) */}
            <MacWindow className="flex flex-[6] flex-col overflow-hidden">
              <MacHeader title={`Breakdown: ${selectedScratch.title}`} />
              
              <div 
                className="flex-1 overflow-y-auto bg-white p-4"
                onFocus={handleBreakdownFocus}
              >
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, index) => (
                      <motion.div
                        key={idea.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                        className="group flex items-center gap-3 border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000] cursor-grab active:cursor-grabbing hover:bg-[hsl(0,0%,95%)]"
                      >
                        <GripVertical className="size-4 text-black/40" />
                        <span className="flex-1 text-[11px] font-bold uppercase tracking-tight text-black">
                          {idea.title}
                        </span>
                        <button 
                          onClick={() => handleRemoveIdea(idea.id)}
                          className="size-5 flex items-center justify-center border border-black bg-white hover:bg-black hover:text-white"
                        >
                          <Trash2 size={10} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-auto border-t-2 border-black p-3 bg-[hsl(0,0%,90%)]">
                <form onSubmit={handleAddIdea} className="flex gap-2">
                  <input
                    type="text"
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    onFocus={handleBreakdownFocus}
                    placeholder="Scribble idea..."
                    className="flex-1 border-2 border-black bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider outline-none focus:bg-black focus:text-white placeholder:text-black/30"
                  />
                  <MacButton type="submit">Add</MacButton>
                </form>
              </div>
            </MacWindow>

            {/* Node / Bit Staging (40%) */}
            <MacWindow className="flex flex-[4] flex-col overflow-hidden">
              <MacHeader title="Staging Area" />
              
              <div className="flex h-full min-h-0 gap-3 p-3">
                {/* Node Zone (35%) */}
                <div 
                  className={cn(
                    "flex flex-[35] flex-col border-2 border-dashed border-black p-2 transition-colors",
                    dragOverZone === 'node' ? "bg-black text-white" : "bg-white"
                  )}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest border-b border-black pb-1">Nodes</p>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {nodeCandidates.map(node => (
                      <div 
                        key={node.id} 
                        draggable 
                        onDragStartCapture={(e) => onDragStart(e, node.id, "node-candidate")}
                        className="flex flex-col items-center justify-center border-2 border-black bg-white p-2 shadow-[2px_2px_0px_#000] cursor-grab active:invert"
                      >
                        <node.icon size={20} className="text-black" />
                        <span className="mt-1 w-full truncate text-center text-[8px] font-bold uppercase text-black">
                          {node.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bit Zone (65%) */}
                <div 
                  className={cn(
                    "flex flex-[65] flex-col border-2 border-dashed border-black p-2 transition-colors",
                    dragOverZone === 'bit' ? "bg-black text-white" : "bg-white"
                  )}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest border-b border-black pb-1">Bits</p>
                  <div className="flex flex-col gap-2 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {bitCandidates.map(bit => (
                      <div 
                        key={bit.id} 
                        draggable 
                        onDragStartCapture={(e) => onDragStart(e, bit.id, "bit-candidate")}
                        className="flex items-center gap-2 border-2 border-black bg-white px-2 py-1.5 shadow-[2px_2px_0px_#000] cursor-grab active:invert"
                      >
                        <FileText size={12} className="text-black" />
                        <span className="truncate text-[9px] font-bold uppercase tracking-tight text-black">
                          {bit.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </MacWindow>
          </div>

          {/* Bottom Section (40%) - Hierarchy Explorer */}
          <MacWindow className="flex min-h-0 flex-[4] flex-col overflow-hidden">
            <div className="flex h-8 shrink-0 items-center justify-between border-b-2 border-black px-3">
              <div className="flex items-center gap-2">
                <Folder size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Hierarchy Explorer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Find..."
                    className="h-5 w-32 border border-black bg-white pl-6 pr-2 text-[9px] font-bold outline-none focus:bg-black focus:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-1 gap-px bg-black overflow-hidden">
              {[0, 1, 2, 3].map((level) => {
                const columnId = level === 0 ? "home" : hierarchyPath[level];
                const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                const isLocked = level > activeLevel;
                const isDragOver = dragOverZone === `hierarchy-${level}`;

                return (
                  <div 
                    key={level}
                    className={cn(
                      "flex flex-1 flex-col bg-[hsl(0,0%,90%)] p-2 transition-opacity",
                      isLocked && "opacity-30",
                      isDragOver && "bg-black text-white"
                    )}
                    onDragOver={(e) => {
                      if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => {
                      if (!isLocked) onDropToHierarchy(e, level);
                    }}
                  >
                    <header className="mb-2 flex items-center justify-between border-b border-black/20 pb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest">
                        {level === 0 ? "Home" : `L${level}`}
                      </span>
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
                      {column.nodes.map(node => (
                        <button
                          key={node.id}
                          onClick={() => handleNodeClick(node.id, level)}
                          className={cn(
                            "flex w-full items-center gap-2 px-1 py-1 text-left transition-all",
                            hierarchyPath[level + 1] === node.id
                              ? "bg-black text-white"
                              : "hover:bg-white border border-transparent hover:border-black"
                          )}
                        >
                          <node.icon size={12} />
                          <span className="flex-1 truncate text-[9px] font-bold uppercase">
                            {node.title}
                          </span>
                          <ChevronRight size={10} />
                        </button>
                      ))}
                      {column.bits.map(bit => (
                        <div key={bit.id} className="flex items-center gap-2 px-1 py-1 text-black/60">
                          <FileText size={10} />
                          <span className="truncate text-[9px] font-bold uppercase italic">
                            {bit.title}
                          </span>
                        </div>
                      ))}
                      
                      {placedItems[level] && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-2 border-2 border-black bg-white p-1"
                        >
                          <div className="flex items-center justify-between border-b border-black mb-1">
                            <span className="text-[8px] font-bold uppercase">Placed</span>
                            <button onClick={() => {
                              const next = {...placedItems};
                              delete next[level];
                              setPlacedItems(next);
                            }}>
                              <X size={8} />
                            </button>
                          </div>
                          <p className="truncate text-[8px] font-bold italic">{placedItems[level]}</p>
                        </motion.div>
                      )}

                      {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center border-2 border-dashed border-black/20 p-2">
                          <p className="text-[8px] font-bold uppercase text-black/30">Empty</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </MacWindow>
        </div>
      </div>
    </div>
  );
}
