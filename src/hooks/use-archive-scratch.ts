import { getDataStore } from "@/lib/db/datastore";

export function useArchiveScratch(): {
  archiveScratch: (scratchId: string) => Promise<void>;
} {
  async function archiveScratch(scratchId: string): Promise<void> {
    const ds = await getDataStore();
    await ds.archiveBit(scratchId);
  }

  return { archiveScratch };
}
