"use client";

import { createContext, useContext } from "react";

type AddFlowContextValue = {
  openAddAtCell: (x: number, y: number) => void;
};

const AddFlowContext = createContext<AddFlowContextValue | null>(null);

export function AddFlowProvider({
  children,
  openAddAtCell,
}: {
  children: React.ReactNode;
  openAddAtCell: (x: number, y: number) => void;
}) {
  return (
    <AddFlowContext.Provider value={{ openAddAtCell }}>
      {children}
    </AddFlowContext.Provider>
  );
}

export function useAddFlow(): AddFlowContextValue {
  const context = useContext(AddFlowContext);

  if (!context) {
    throw new Error("useAddFlow must be used within AddFlowProvider");
  }

  return context;
}
