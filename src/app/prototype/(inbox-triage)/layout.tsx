"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="relative ml-12 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
