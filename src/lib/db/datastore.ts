import type { Node, CreateNode, Bit, CreateBit, Chunk, CreateChunk } from "@/lib/db/schema";

export interface DataStore {
  // --- Nodes ---
  getNode(id: string): Promise<Node | undefined>;
  getNodes(parentId: string | null): Promise<Node[]>;
  createNode(data: CreateNode): Promise<Node>;
  updateNode(id: string, data: Partial<Node>): Promise<void>;
  softDeleteNode(id: string): Promise<void>;
  restoreNode(id: string): Promise<void>;
  hardDeleteNode(id: string): Promise<void>;
  cleanupExpiredTrash(): Promise<void>;

  getAllActiveNodes(): Promise<Node[]>;

  // --- Bits ---
  getBit(id: string): Promise<Bit | undefined>;
  getBits(parentId: string): Promise<Bit[]>;
  getBitsForNode(nodeId: string): Promise<Bit[]>;
  getAllActiveBits(): Promise<Bit[]>;
  createBit(data: CreateBit): Promise<Bit>;
  updateBit(id: string, data: Partial<Bit>): Promise<void>;
  softDeleteBit(id: string): Promise<void>;
  restoreBit(id: string): Promise<void>;
  hardDeleteBit(id: string): Promise<void>;

  // --- Chunks ---
  getChunks(bitId: string): Promise<Chunk[]>;
  createChunk(data: CreateChunk): Promise<Chunk>;
  updateChunk(id: string, data: Partial<Chunk>): Promise<void>;
  deleteChunk(id: string): Promise<void>;

  // --- Queries ---
  getActiveGridContents(parentId: string | null): Promise<{ nodes: Node[]; bits: Bit[] }>;
  getCalendarItems(): Promise<{ bits: Bit[]; chunks: Chunk[] }>;
  getTrashedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>;
  searchAll(query: string): Promise<Array<{
    type: "node" | "bit" | "chunk";
    item: Node | Bit | Chunk;
    parentPath: string[];
    parentNodeId?: string;
    parentBitId?: string;
    grandparentNodeId?: string;
  }>>;
  getGridOccupancy(parentId: string | null): Promise<Set<string>>;
  promoteBitToNode(bitId: string): Promise<Node>;

  /** Returns child Bits whose deadlines exceed the given deadline. Used before/after updateNode to detect conflicts. */
  getChildDeadlineConflicts(nodeId: string, deadline: number): Promise<Bit[]>;
}

let cachedDataStore: DataStore | null = null;

export async function getDataStore(): Promise<DataStore> {
  if (cachedDataStore) {
    return cachedDataStore;
  }

  const dataStoreModule = await import("@/lib/db/indexeddb");
  cachedDataStore = dataStoreModule.indexedDBStore;
  return cachedDataStore;
}
