"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/indexeddb";
import { getUrgencyLevel } from "@/lib/utils/urgency";
import type { UrgencyLevel } from "@/types";

/**
 * Reactively computes the highest urgency level across all active Bits
 * that have an approaching or past deadline.
 * Returns null when no urgent Bits exist.
 * Consumed by the sidebar Calendar button urgency dot.
 */
export function useGlobalUrgency(): UrgencyLevel {
  const [urgency, setUrgency] = useState<UrgencyLevel>(null);

  useEffect(() => {
    const subscription = liveQuery(() => db.bits.toArray()).subscribe({
      next: (bits) => {
        const activeBits = bits.filter((b) => b.deletedAt === null && b.deadline !== null);
        let max: UrgencyLevel = null;

        for (const bit of activeBits) {
          const level = getUrgencyLevel(bit.deadline);
          if (level !== null && (max === null || level > max)) {
            max = level;
          }
        }

        setUrgency(max);
      },
      error: (err) => console.error("useGlobalUrgency liveQuery error:", err),
    });

    return () => subscription.unsubscribe();
  }, []);

  return urgency;
}
