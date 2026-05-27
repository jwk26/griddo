"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, X, Home, Zap, Box, Book, Star, Sparkles, Trash2, Moon, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// --- Mock Data & Constants ---

const VARIANTS = [
  { id: 1, name: "Surface (Main)" },
  { id: 3, name: "Palette" },
  { id: 4, name: "Favorites" },
];

// --- Sub-components ---

const Toolbar = ({ activeVariant, setActiveVariant }: { activeVariant: number, setActiveVariant: (id: number) => void }) => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-1 p-1 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-2xl overflow-hidden max-w-[95vw]">
    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r border-border mr-1 whitespace-nowrap text-left text-left">Review Styles</div>
    <div className="flex gap-1 overflow-x-auto no-scrollbar px-2 text-left">
      {VARIANTS.map((v) => (
        <button key={v.id} onClick={() => setActiveVariant(v.id)} className={cn("px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap", activeVariant === v.id ? "bg-primary text-primary-foreground shadow-lg scale-105" : "hover:bg-accent text-muted-foreground hover:text-foreground")}>
          {v.name}
        </button>
      ))}
    </div>
  </div>
);

// --- Prototype Shell ---

const PrototypeShell = ({ children, onAddClick, isFavoritesOpen, onFavoritesClick }: any) => (
  <div className="relative min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] font-sans text-foreground overflow-hidden text-left">
    <aside className="fixed left-0 top-0 z-40 flex h-full w-12 flex-col items-center gap-1 border-r border-border/50 bg-background/50 backdrop-blur-xl py-3 text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground opacity-20"><Home className="h-5 w-5" /></div>
      <button onClick={onAddClick} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-foreground"><Plus className="h-5 w-5" /></button>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
      <button onClick={onFavoritesClick} className={cn("flex h-10 w-10 items-center justify-center rounded-lg transition-all", isFavoritesOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent")}>
        <motion.div animate={{ rotate: isFavoritesOpen ? 360 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}><Star className={cn("h-5 w-5", isFavoritesOpen && "fill-primary")} /></motion.div>
      </button>
      <div className="mt-auto flex flex-col items-center gap-1 opacity-20 text-left"><div className="flex h-10 w-10 items-center justify-center rounded-lg text-left"><Trash2 className="h-5 w-5" /></div><div className="flex h-10 w-10 items-center justify-center rounded-lg text-left"><Moon className="h-5 w-5" /></div></div>
    </aside>
    <main className="pl-12 pt-16 h-screen relative text-left">{children}</main>
  </div>
);

// --- Modals ---

const ScratchModal = ({ isOpen, onClose }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/40 backdrop-blur-sm text-left" />
        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="relative w-full max-w-lg bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden p-4 text-left">
          <div className="flex items-center gap-3 text-left"><Zap className="w-5 h-5 text-primary fill-primary" /><input autoFocus placeholder="Capture your ideas..." className="flex-1 bg-transparent border-none outline-none text-lg text-left" /></div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const CreateNodeModal = ({ isOpen, onClose }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 text-left text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/40 backdrop-blur-sm text-left" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-md bg-popover border border-border shadow-2xl rounded-3xl p-8 text-left">
          <div className="flex items-center justify-between mb-8 text-left"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-left">New Node</span><X onClick={onClose} className="w-4 h-4 cursor-pointer opacity-20 hover:opacity-100 text-left" /></div>
          <input autoFocus placeholder="Node Title" className="w-full bg-transparent border-none outline-none text-3xl font-bold tracking-tight mb-8 text-left" />
          <div className="flex gap-4 text-left"><button className="flex-1 bg-primary text-primary-foreground py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 text-center text-xs uppercase tracking-widest text-center">Create</button><button onClick={onClose} className="px-6 py-3 rounded-2xl hover:bg-accent font-bold text-center text-xs uppercase tracking-widest text-center">Cancel</button></div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const CreateBitModal = ({ isOpen, onClose }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 text-left text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/40 backdrop-blur-sm text-left" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-popover border border-border shadow-2xl rounded-3xl flex overflow-hidden text-left">
          <div className="flex-1 p-8 text-left text-left">
             <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 text-left">New Action Unit</div>
             <input autoFocus placeholder="What needs to be done?" className="w-full bg-transparent border-none outline-none text-2xl font-bold text-left mb-4 text-left" />
             <textarea placeholder="Details..." className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground resize-none h-32 text-left text-left" />
             <div className="mt-8 flex gap-2 text-left"><button className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-center text-xs uppercase tracking-widest text-center">Create Bit</button></div>
          </div>
          <div className="w-64 bg-muted/30 border-l border-border p-6 text-left text-left text-left"><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 text-left">Placement</div><div className="space-y-1 text-left text-xs font-bold text-left">{["Home", "Work", "Personal"].map(i => <div key={i} className="p-2 rounded-lg hover:bg-background cursor-pointer text-left">{i}</div>)}</div></div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Core Entry Variants ---

const Variant1 = ({ isOpen, onClose, openScratch, openNode, openBit }: any) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }} 
        className="fixed left-[60px] top-[56px] z-[100] w-56 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden p-1.5 text-left"
      >
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">Ideas</div>
        <button onClick={() => { openScratch(); onClose(); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left group"><div className="flex items-center gap-3 text-left text-left text-left text-left"><div className="p-1.5 rounded-md bg-primary/10 text-primary text-left text-left text-left text-left text-left text-left text-left text-left text-left"><Zap className="w-4 h-4 fill-primary" /></div><span className="text-sm font-medium">Scratch</span></div><span className="text-[10px] text-muted-foreground group-hover:text-foreground bg-muted px-1.5 py-0.5 rounded">⌘K</span></button>
        <div className="h-px bg-border my-1.5 mx-2 text-left text-left" />
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-left">Create</div>
        <button onClick={() => { openNode(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"><div className="p-1.5 rounded-md bg-secondary text-muted-foreground text-left text-left text-left text-left text-left text-left text-left text-left text-left"><Box className="w-4 h-4" /></div><span className="text-sm font-medium">Node</span></button>
        <button onClick={() => { openBit(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"><div className="p-1.5 rounded-md bg-secondary text-muted-foreground text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><Book className="w-4 h-4" /></div><span className="text-sm font-medium">Bit</span></button>
      </motion.div>
    )}
  </AnimatePresence>
);

const Variant3 = ({ isOpen, onClose, openScratch, openNode, openBit }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] text-left text-left">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-background/20 backdrop-blur-md text-left" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-xl bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden text-left text-left">
          <div className="p-2 text-left text-left">
            <div className="flex items-center gap-3 px-3 py-3 border-b border-border mb-2 text-left text-left text-left text-left text-left"><Search className="w-5 h-5 text-muted-foreground" /><input autoFocus placeholder="What would you like to do?" className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground text-left text-left text-left" /></div>
            <div className="space-y-1 text-left text-left">
              <button onClick={() => { openScratch(); onClose(); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all group text-left text-left text-left text-left text-left"><div className="flex items-center gap-3 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><Zap className="w-4 h-4" /><span className="text-sm font-medium">Quick Capture Scratch</span></div><span className="text-[10px] opacity-60">⌘K</span></button>
              <button onClick={() => { openNode(); onClose(); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-all group text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><div className="flex items-center gap-3 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><div className="p-1.5 rounded-md bg-secondary text-muted-foreground"><Box className="w-4 h-4" /></div><span className="text-sm font-medium text-foreground">Create new Node</span></div><span className="text-[10px] text-muted-foreground">N</span></button>
              <button onClick={() => { openBit(); onClose(); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent transition-all group text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><div className="flex items-center gap-3 text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left text-left"><div className="p-1.5 rounded-md bg-secondary text-muted-foreground"><Book className="w-4 h-4" /></div><span className="text-sm font-medium text-foreground">Create new Bit</span></div><span className="text-[10px] text-muted-foreground">B</span></button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Variant4 = ({ isOpen, onClose }: any) => {
  const favorites = [
    { name: "Work", color: "hsl(217, 91%, 60%)", x: 80, y: -60 },
    { name: "Personal", color: "hsl(271, 91%, 65%)", x: 110, y: 0 },
    { name: "Fitness", color: "hsl(84, 81%, 44%)", x: 80, y: 60 }
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed left-12 top-[102px] z-50 pointer-events-none text-left text-left text-left">
          <div className="fixed inset-0 pointer-events-auto z-[-1] text-left" onClick={onClose} />
          {favorites.map((fav, i) => (
            <motion.button key={fav.name} initial={{ scale: 0, x: 0, y: 0, opacity: 0 }} animate={{ scale: 1, x: fav.x, y: fav.y, opacity: 1 }} exit={{ scale: 0, x: 0, y: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.05 }} className="absolute pointer-events-auto group text-left text-left text-left" style={{ left: 0, top: 0 }}>
              <div className="flex flex-col items-center gap-2 text-left text-left text-left">
                <div className="w-14 h-14 rounded-[20px] shadow-2xl flex items-center justify-center border-2 border-white/20 backdrop-blur-md transition-transform group-hover:scale-110 active:scale-95 text-center text-center text-center" style={{ backgroundColor: fav.color }}><Box className="w-6 h-6 text-white" /></div>
                <div className="px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border text-[10px] font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-center text-center text-center text-center">{fav.name}</div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main Page Component ---

export default function QuickCapturePrototype() {
  const [activeVariant, setActiveVariant] = useState(1);
  const [isEntryOpen, setIsEntryOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isScratchOpen, setIsScratchOpen] = useState(false);
  const [isNodeOpen, setIsNodeOpen] = useState(false);
  const [isBitOpen, setIsBitOpen] = useState(false);

  useEffect(() => {
    const h = (e: any) => { 
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setIsScratchOpen(true); } 
      if (e.key === "Escape") { setIsEntryOpen(false); setIsFavoritesOpen(false); setIsScratchOpen(false); setIsNodeOpen(false); setIsBitOpen(false); } 
    };
    window.addEventListener("keydown", h); 
    return () => window.removeEventListener("keydown", h);
  }, []);

  const openNode = () => { setIsNodeOpen(true); setIsEntryOpen(false); };
  const openBit = () => { setIsBitOpen(true); setIsEntryOpen(false); };
  const vProps = { isOpen: isEntryOpen, onClose: () => setIsEntryOpen(false), openScratch: () => setIsScratchOpen(true), openNode, openBit };

  return (
    <PrototypeShell onAddClick={() => { setIsFavoritesOpen(false); setIsEntryOpen(!isEntryOpen); }} isFavoritesOpen={isFavoritesOpen} onFavoritesClick={() => { setIsEntryOpen(false); setIsFavoritesOpen(!isFavoritesOpen); }}>
      <Toolbar activeVariant={activeVariant} setActiveVariant={setActiveVariant} />
      <div className="p-8 grid grid-cols-6 gap-4 opacity-10 pointer-events-none text-left text-left text-left text-left">{Array.from({ length: 18 }).map((_, i) => (<div key={i} className="aspect-square rounded-[32px] border border-dashed border-border flex items-center justify-center text-border text-4xl font-bold text-center text-center text-center">{i + 1}</div>))}</div>
      
      {activeVariant === 1 && <Variant1 {...vProps} />}
      {activeVariant === 3 && <Variant3 {...vProps} />}
      {activeVariant === 4 && <Variant4 isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />}
      
      <ScratchModal isOpen={isScratchOpen} onClose={() => setIsScratchOpen(false)} />
      <CreateNodeModal isOpen={isNodeOpen} onClose={() => setIsNodeOpen(false)} />
      <CreateBitModal isOpen={isBitOpen} onClose={() => setIsBitOpen(false)} />

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm text-center text-center text-center text-center">Press ⌘K for Scratch capture</div>
    </PrototypeShell>
  );
}
