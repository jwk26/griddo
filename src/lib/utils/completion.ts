import type { Bit } from "@/types";

export function isNodeComplete(bits: Bit[]): boolean {
  return bits.length > 0 && bits.every((bit) => bit.status === "complete");
}
