"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { indexedDBStore } from "@/lib/db/indexeddb";
import type { Bit, Chunk } from "@/types";

type BitDetailState = {
  bitId: string | null;
  bit: Bit | null;
  chunks: Chunk[];
};

const INITIAL_BIT_DETAIL: BitDetailState = {
  bitId: null,
  bit: null,
  chunks: [],
};

export function useBitDetail(): {
  bit: Bit | null;
  chunks: Chunk[];
  isOpen: boolean;
  close: () => void;
} {
  const [state, setState] = useState<BitDetailState>(INITIAL_BIT_DETAIL);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const bitId = searchParams.get("bit");
  const isOpen = bitId !== null;

  useEffect(() => {
    if (!bitId) {
      return;
    }

    const subscription = liveQuery(() =>
      Promise.all([
        indexedDBStore.getBit(bitId),
        indexedDBStore.getChunks(bitId),
      ]),
    ).subscribe({
      next: ([bit, chunks]) => {
        setState({
          bitId,
          bit: bit ?? null,
          chunks,
        });
      },
      error: (error) => {
        console.error("liveQuery error:", error);
      },
    });

    return () => subscription.unsubscribe();
  }, [bitId]);

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("bit");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  if (!bitId || state.bitId !== bitId) {
    return {
      bit: null,
      chunks: [],
      isOpen,
      close,
    };
  }

  return {
    bit: state.bit,
    chunks: state.chunks,
    isOpen,
    close,
  };
}
