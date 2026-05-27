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
  Terminal as TerminalIcon,
  Command,
  Activity,
  Cpu,
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
      { id: "work", title: "Work", color: "currentColor" },
      { id: "personal", title: "Personal", color: "currentColor" },
      { id: "projects", title: "Projects", color: "currentColor" },
    ],
    bits: [],
  },
  work: {
    nodes: [
      { id: "meeting", title: "Meetings", color: "currentColor" },
      { id: "admin", title: "Admin", color: "currentColor" },
    ],
    bits: [
      { id: "b-work-1", title: "Reply to project lead's email" },
    ],
  },
  personal: {
    nodes: [
      { id: "health", title: "Health", color: "currentColor" },
      { id: "finance", title: "Finance", color: "currentColor" },
    ],
    bits: [
      { id: "b-pers-1", title: "Book dentist appointment" },
    ],
  },
  projects: {
    nodes: [
      { id: "griddo", title: "GridDO Development", color: "currentColor" },
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

// --- Terminal Components ---

function Scanlines() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}

function TerminalPanel({
  children,
  className,
  title,
  meta,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  meta?: string;
  variant?: "default" | "active" | "error";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col border-2 border-[var(--foreground)] bg-[var(--background)] transition-all duration-300",
        "hover:shadow-[0_0_20px_hsl(var(--foreground)/0.2)]",
        variant === "active" && "shadow-[0_0_15px_hsl(var(--foreground)/0.3)]",
        className
      )}
      style={{
        borderStyle: "var(--theme-line-style, solid)",
      }}
    >
      {/* Panel Headers */}
      {title && (
        <div className="flex h-10 shrink-0 items-center justify-between border-b-2 border-[var(--foreground)] px-4 font-mono text-[10px] uppercase tracking-widest text-[var(--foreground)]"
             style={{ borderStyle: "var(--theme-line-style, solid)" }}>
          <div className="flex items-center gap-2">
            <span className="opacity-50">[{title}]</span>
          </div>
          {meta && <span className="opacity-50">{meta}</span>}
        </div>
      )}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
      
      {/* ASCII Corners */}
      <div className="absolute -left-[2px] -top-[2px] size-1 bg-[var(--foreground)]" />
      <div className="absolute -right-[2px] -top-[2px] size-1 bg-[var(--foreground)]" />
      <div className="absolute -bottom-[2px] -left-[2px] size-1 bg-[var(--foreground)]" />
      <div className="absolute -bottom-[2px] -right-[2px] size-1 bg-[var(--foreground)]" />
    </div>
  );
}

function TerminalButton({
  children,
  onClick,
  className,
  active,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "group relative border-2 border-[var(--foreground)] px-3 py-1 font-mono text-xs uppercase transition-all",
        active ? "bg-[var(--foreground)] text-black" : "text-[var(--foreground)] hover:bg-[var(--foreground)]/10",
        className
      )}
      style={{ borderStyle: "var(--theme-line-style, solid)" }}
    >
      {children}
      {active && <motion.div layoutId="btn-active" className="absolute inset-0 bg-[var(--foreground)] -z-10" />}
    </button>
  );
}

// --- Main Page Component ---

export default function InboxTriageTerminal() {
  const [scratches] = useState(scratchesSeed);
  const [selectedScratchId, setSelectedScratchId] = useState(scratchesSeed[0].id);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [ideas, setIdeas] = useState(ideasSeed);
  const [nodeCandidates, setNodeCandidates] = useState<NodeCandidate[]>([
    { id: "nc1", title: "System Overhaul", color: "currentColor" },
    { id: "nc2", title: "Network Plan", color: "currentColor" },
  ]);
  const [bitCandidates, setBitCandidates] = useState<BitCandidate[]>([
    { id: "bc1", title: "Analyze bandwidth" },
    { id: "bc2", title: "Patch vulnerabilities" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [hierarchyPath, setHierarchyPath] = useState(["home"]);
  const [activeLevel, setActiveLevel] = useState(0);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<number, string>>({});

  // Theme effect
  useEffect(() => {
    document.documentElement.dataset.colorTheme = "terminal";
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
      setNodeCandidates([{ id: `nc-${Date.now()}`, title: idea.title, color: "currentColor" }, ...nodeCandidates]);
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
    <div className="terminal-container flex h-screen w-full flex-col bg-[var(--background)] p-4 font-mono text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-black">
      <Scanlines />
      
      {/* System Header */}
      <header className="mb-4 flex h-16 items-center justify-between border-2 border-[var(--foreground)] px-6" style={{ borderStyle: "dashed" }}>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center border-2 border-[var(--foreground)] bg-[var(--foreground)] text-black">
            <TerminalIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">Terminal Triage v2.0</h1>
            <div className="flex items-center gap-2 text-[10px] opacity-70">
              <Activity size={12} />
              <span>System Status: Optimal</span>
              <span className="mx-1">|</span>
              <Cpu size={12} />
              <span>CPU: 0.04%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-[var(--foreground)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            <div className="size-2 animate-pulse bg-[var(--foreground)]" />
            <span>Process Active</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        
        {/* Scratch Pool (Left) */}
        <motion.div
          animate={{ width: poolCollapsed ? 80 : 300 }}
          className="flex shrink-0 flex-col overflow-hidden"
        >
          <TerminalPanel className="h-full" title={poolCollapsed ? "IN" : "Scratch Pool"}>
            <div className="flex h-full flex-col">
              <div className={cn(
                "flex h-10 items-center px-3 opacity-50 text-[10px] border-b border-[var(--foreground)]",
                poolCollapsed ? "flex-col items-center justify-center gap-2 h-auto py-3" : "justify-between"
              )}>
                {!poolCollapsed && <span>Items: {scratches.length}</span>}
                {poolCollapsed && (
                  <div className="flex flex-col items-center gap-1 mb-1">
                    <Inbox size={16} />
                    <span className="text-[8px]">{scratches.length}</span>
                  </div>
                )}
                <button onClick={() => setPoolCollapsed(!poolCollapsed)} className="hover:text-white">
                  {poolCollapsed ? "[>]" : "[<]"}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex flex-col gap-2">
                  {scratches.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleScratchSelect(s.id)}
                      className={cn(
                        "w-full p-2 text-left border-2 transition-all",
                        selectedScratchId === s.id 
                          ? "bg-[var(--foreground)] text-black border-[var(--foreground)]" 
                          : "border-transparent hover:border-[var(--foreground)]/30 hover:bg-[var(--foreground)]/5",
                        poolCollapsed ? "flex justify-center items-center" : ""
                      )}
                      style={{ borderStyle: "dashed" }}
                    >
                      {!poolCollapsed ? (
                        <>
                          <div className="text-sm font-bold truncate leading-none mb-1">{s.title}</div>
                          <div className="text-[10px] opacity-60 italic">{s.createdAt}</div>
                        </>
                      ) : (
                        <Inbox size={20} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TerminalPanel>
        </motion.div>

        {/* Main Work Area (Right) */}
        <div className="flex flex-1 flex-col gap-4 min-w-0">
          
          {/* Top: Breakdown + Staging */}
          <div className="flex flex-[6] gap-4 min-h-0">
            
            {/* Breakdown (60%) */}
            <TerminalPanel 
              className="flex-[6]" 
              title="Breakdown / Scribble" 
              meta={`CTX: ${selectedScratch.title.slice(0, 15)}...`}
            >
              <div className="flex h-full flex-col">
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
                  onFocus={handleBreakdownFocus}
                >
                  <AnimatePresence initial={false}>
                    {ideas.map((idea, i) => (
                      <motion.div
                        key={idea.id}
                        layout
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, idea.id, "idea")}
                        className="group flex items-center gap-3 border border-[var(--foreground)]/30 p-2 hover:border-[var(--foreground)] hover:bg-[var(--foreground)]/5 cursor-grab active:cursor-grabbing"
                        style={{ borderStyle: "dashed" }}
                      >
                        <GripVertical size={14} className="opacity-30" />
                        <span className="opacity-40">{i+1}.</span>
                        <span className="flex-1 text-sm">{idea.title}</span>
                        <button onClick={() => handleRemoveIdea(idea.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Input Area */}
                <div className="border-t border-[var(--foreground)] p-3" style={{ borderStyle: "dashed" }}>
                  <form onSubmit={handleAddIdea} className="flex gap-2">
                    <span className="text-lg leading-none pt-1">C:\&gt;</span>
                    <input
                      type="text"
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      onFocus={handleBreakdownFocus}
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder:opacity-30"
                      placeholder="Enter idea string..."
                    />
                    <TerminalButton type="submit" className="text-[10px]">Execute</TerminalButton>
                  </form>
                </div>
              </div>
            </TerminalPanel>

            {/* Staging (40%) */}
            <TerminalPanel className="flex-[4]" title="Candidate Staging">
              <div className="flex h-full gap-2 p-3">
                {/* Nodes Zone */}
                <div 
                  className={cn(
                    "flex-[35] border-2 border-dashed border-[var(--foreground)]/20 p-2 flex flex-col transition-colors",
                    dragOverZone === 'node' && "bg-[var(--foreground)]/10 border-[var(--foreground)]"
                  )}
                  onDragOver={(e) => onDragOver(e, 'node')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'node')}
                >
                  <div className="text-[10px] text-center opacity-50 mb-2 font-bold uppercase tracking-widest">Nodes</div>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {nodeCandidates.map(node => (
                      <motion.div
                        key={node.id}
                        layoutId={node.id}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, node.id, "node-candidate")}
                        className="aspect-square border border-[var(--foreground)] flex flex-col items-center justify-center p-2 hover:bg-[var(--foreground)] hover:text-black cursor-grab transition-colors"
                      >
                        <Box size={20} />
                        <span className="text-[9px] mt-1 text-center leading-tight truncate w-full uppercase">{node.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bits Zone */}
                <div 
                  className={cn(
                    "flex-[65] border-2 border-dashed border-[var(--foreground)]/20 p-2 flex flex-col transition-colors",
                    dragOverZone === 'bit' && "bg-[var(--foreground)]/10 border-[var(--foreground)]"
                  )}
                  onDragOver={(e) => onDragOver(e, 'bit')}
                  onDragLeave={() => setDragOverZone(null)}
                  onDrop={(e) => onDropToStaging(e, 'bit')}
                >
                  <div className="text-[10px] text-center opacity-50 mb-2 font-bold uppercase tracking-widest">Bits</div>
                  <div className="flex-1 overflow-y-auto space-y-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:display-none">
                    {bitCandidates.map(bit => (
                      <motion.div
                        key={bit.id}
                        layoutId={bit.id}
                        draggable
                        onDragStartCapture={(e) => onDragStart(e, bit.id, "bit-candidate")}
                        className="border border-[var(--foreground)]/50 p-2 text-[11px] flex items-center gap-2 hover:bg-[var(--foreground)] hover:text-black cursor-grab group transition-colors"
                        style={{ borderStyle: "dashed" }}
                      >
                        <Command size={10} className="opacity-50 group-hover:opacity-100" />
                        <span className="truncate">{bit.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TerminalPanel>
          </div>

          {/* Bottom: Hierarchy (40%) */}
          <TerminalPanel className="flex-[4]" title="Hierarchy Explorer" meta="MODE: NAV/WRITE">
            <div className="flex h-full flex-col">
              <div className="h-8 border-b border-[var(--foreground)] flex items-center px-4 gap-4 text-[10px] opacity-60" style={{ borderStyle: "dashed" }}>
                <div className="flex items-center gap-1">
                  <Search size={12} />
                  <span>PATH: {hierarchyPath.join(" / ").toUpperCase()}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-4 bg-[var(--foreground)]/10">
                {[0, 1, 2, 3].map((level) => {
                  const columnId = level === 0 ? "home" : hierarchyPath[level];
                  const column = hierarchyData[columnId] || { nodes: [], bits: [] };
                  const isLocked = level > activeLevel;
                  const isDragOver = dragOverZone === `hierarchy-${level}`;

                  return (
                    <div 
                      key={level}
                      className={cn(
                        "border-r border-[var(--foreground)]/30 p-2 flex flex-col transition-all",
                        isLocked && "opacity-20 pointer-events-none",
                        isDragOver && "bg-[var(--foreground)]/20"
                      )}
                      onDragOver={(e) => {
                        if (!isLocked) onDragOver(e, `hierarchy-${level}`);
                      }}
                      onDragLeave={() => setDragOverZone(null)}
                      onDrop={(e) => {
                        if (!isLocked) onDropToHierarchy(e, level);
                      }}
                    >
                      <div className="text-[9px] opacity-40 uppercase tracking-tighter mb-2">Lvl_{level}</div>
                      <div className="flex-1 overflow-y-auto space-y-1">
                        {column.nodes.map(node => (
                          <button
                            key={node.id}
                            onClick={() => handleNodeClick(node.id, level)}
                            className={cn(
                              "w-full text-left p-1 text-xs flex items-center justify-between group",
                              hierarchyPath[level + 1] === node.id ? "bg-[var(--foreground)] text-black" : "hover:bg-[var(--foreground)]/10"
                            )}
                          >
                            <span className="truncate font-bold">DIR_{node.title}</span>
                            <ChevronRight size={12} className={cn("opacity-0", hierarchyPath[level + 1] === node.id && "opacity-100")} />
                          </button>
                        ))}
                        {column.bits.map(bit => (
                          <div key={bit.id} className="p-1 text-[11px] opacity-70 flex items-center gap-2">
                            <span className="text-[var(--foreground)] opacity-50">•</span>
                            <span className="truncate">{bit.title}</span>
                          </div>
                        ))}

                        {/* Drop UI */}
                        {placedItems[level] && (
                          <div className="mt-2 border border-[var(--foreground)] p-1 text-[9px] relative animate-pulse">
                            <div className="text-[var(--foreground)] font-bold mb-1">DATA_PLACED</div>
                            <div className="opacity-70 truncate">{placedItems[level]}</div>
                            <button className="absolute top-0 right-1" onClick={() => {
                              const next = {...placedItems};
                              delete next[level];
                              setPlacedItems(next);
                            }}>[X]</button>
                          </div>
                        )}
                        
                        {!isLocked && column.nodes.length === 0 && column.bits.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center opacity-20 border border-dashed border-[var(--foreground)] mt-2">
                            <Plus size={16} />
                            <span className="text-[8px] mt-1">DROP_HERE</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TerminalPanel>

        </div>
      </div>

      <footer className="mt-4 flex h-8 items-center justify-between border-t border-[var(--foreground)]/30 px-2 font-mono text-[9px] opacity-40">
        <div className="flex gap-4">
          <span>MEM: 640KB OK</span>
          <span>DISK: 1.2GB FREE</span>
        </div>
        <div>SESSION: 0x88F2 - USER: ADMIN</div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--foreground);
          opacity: 0.3;
        }
        @keyframes flicker {
          0% { opacity: 0.99; }
          5% { opacity: 0.98; }
          10% { opacity: 0.97; }
          15% { opacity: 0.98; }
          20% { opacity: 0.99; }
          25% { opacity: 0.98; }
          30% { opacity: 0.97; }
          100% { opacity: 1; }
        }
        .terminal-container {
          animation: flicker 0.15s infinite;
        }
      `}</style>
    </div>
  );
}
