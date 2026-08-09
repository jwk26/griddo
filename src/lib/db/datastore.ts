import type {
  Node,
  CreateNode,
  UpdateNode,
  Bit,
  CreateBit,
  UpdateBit,
  Chunk,
  CreateChunk,
  ScratchBreakdown,
  CreateScratchBreakdown,
  UpdateScratchBreakdown,
  StagedCandidate,
  RepositoryOperationCommand,
  RepositoryOperationResult,
  RepositoryOperationStatus,
} from "@/lib/db/schema";

export type AddBreakdownCommand = RepositoryOperationCommand<{
  breakdownId: string;
  scratchBitId: string;
  scratchExpectedVersion: number;
  content: string;
}>;

export type AddBreakdownResult = RepositoryOperationResult<{
  status: RepositoryOperationStatus;
  breakdown: ScratchBreakdown | null;
  scratch: Bit | null;
}>;

export type SaveScratchTitleCommand = RepositoryOperationCommand<{
  scratchBitId: string;
  expectedVersion: number;
  baseTitle: string;
  title: string;
}>;

export type SaveScratchTitleResult = RepositoryOperationResult<{
  status: RepositoryOperationStatus;
  scratch: Bit | null;
}>;

export type SaveBreakdownCommand = RepositoryOperationCommand<{
  breakdownId: string;
  expectedVersion: number;
  baseContent: string;
  baseOrder: number;
  content: string;
  order: number;
}>;

export type SaveBreakdownResult = RepositoryOperationResult<{
  status: RepositoryOperationStatus;
  breakdown: ScratchBreakdown | null;
  candidate: StagedCandidate | null;
  scratch: Bit | null;
}>;

export type DeleteBreakdownCommand = RepositoryOperationCommand<{
  breakdownId: string;
  expectedVersion: number;
  scratchBitId: string;
  scratchExpectedVersion: number;
}>;

export type DeleteBreakdownResult = RepositoryOperationResult<{
  status: RepositoryOperationStatus;
  breakdown: ScratchBreakdown | null;
  candidate: StagedCandidate | null;
  scratch: Bit | null;
}>;

export type AggregateHardDeleteResult =
  | { status: "deleted" }
  | {
      status: "integrity_cleanup_required";
      candidates: StagedCandidate[];
    };

export interface DataStore {
  // --- Nodes ---
  getNode(id: string): Promise<Node | undefined>;
  getNodes(parentId: string | null): Promise<Node[]>;
  createNode(data: CreateNode): Promise<Node>;
  updateNode(id: string, data: UpdateNode): Promise<void>;
  softDeleteNode(id: string): Promise<void>;
  restoreNode(id: string): Promise<void>;
  hardDeleteNode(id: string): Promise<AggregateHardDeleteResult>;
  cleanupExpiredTrash(): Promise<AggregateHardDeleteResult>;

  getAllActiveNodes(): Promise<Node[]>;

  // --- Bits ---
  getBit(id: string): Promise<Bit | undefined>;
  getBits(parentId: string): Promise<Bit[]>;
  getBitsForNode(nodeId: string): Promise<Bit[]>;
  getAllActiveBits(): Promise<Bit[]>;
  createBit(data: CreateBit): Promise<Bit>;
  updateBit(id: string, data: UpdateBit): Promise<void>;
  softDeleteBit(id: string): Promise<void>;
  restoreBit(id: string): Promise<void>;
  hardDeleteBit(id: string): Promise<AggregateHardDeleteResult>;

  // --- Lifecycle ---
  archiveNode(id: string): Promise<void>;
  archiveBit(id: string): Promise<void>;
  unarchiveNode(id: string): Promise<void>;
  unarchiveBit(id: string): Promise<void>;

  // --- System Node Seeding ---
  /**
   * Idempotently ensures the Inbox and Archive View system nodes exist.
   * Creates only missing roles; existing nodes are never overwritten.
   * Normalizes lifecycle-drifted system nodes (deletedAt/archivedAt → null).
   * Throws "GRID_FULL: ..." if no L0 cell is available for a required node.
   */
  ensureSystemNodes(): Promise<void>;

  // --- Scratch Breakdowns ---
  createScratchBreakdown(data: CreateScratchBreakdown): Promise<ScratchBreakdown>;
  getScratchBreakdowns(scratchBitId: string): Promise<ScratchBreakdown[]>;
  updateScratchBreakdown(id: string, data: UpdateScratchBreakdown): Promise<void>;
  markScratchBreakdownConsumed(id: string): Promise<void>;
  unconsumeScratchBreakdown(id: string): Promise<void>;
  deleteScratchBreakdown(id: string): Promise<void>;

  // --- Authoritative Inbox Breakdown Commands ---
  addBreakdown(command: AddBreakdownCommand): Promise<AddBreakdownResult>;
  reconcileAddBreakdown(command: AddBreakdownCommand): Promise<AddBreakdownResult>;
  saveScratchTitle(
    command: SaveScratchTitleCommand,
  ): Promise<SaveScratchTitleResult>;
  reconcileSaveScratchTitle(
    command: SaveScratchTitleCommand,
  ): Promise<SaveScratchTitleResult>;
  saveBreakdown(command: SaveBreakdownCommand): Promise<SaveBreakdownResult>;
  reconcileSaveBreakdown(
    command: SaveBreakdownCommand,
  ): Promise<SaveBreakdownResult>;
  deleteBreakdown(command: DeleteBreakdownCommand): Promise<DeleteBreakdownResult>;
  reconcileDeleteBreakdown(
    command: DeleteBreakdownCommand,
  ): Promise<DeleteBreakdownResult>;

  // --- Chunks ---
  getChunks(bitId: string): Promise<Chunk[]>;
  createChunk(data: CreateChunk): Promise<Chunk>;
  updateChunk(id: string, data: Partial<Chunk>): Promise<void>;
  deleteChunk(id: string): Promise<void>;

  // --- Queries ---
  getActiveGridContents(parentId: string | null): Promise<{ nodes: Node[]; bits: Bit[] }>;
  getCalendarItems(): Promise<{ bits: Bit[]; chunks: Chunk[] }>;
  getTrashedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>;
  getArchivedItems(): Promise<{ nodes: Node[]; bits: Bit[] }>;
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
  getChildDeadlineConflicts(nodeId: string, deadline: number, deadlineAllDay: boolean): Promise<Bit[]>;

  /**
   * Relocates active items in this parent whose position overlaps the breadcrumb
   * blocked zone. Runs exactly once per parent across sessions (durable marker).
   * Returns the count of relocated items. Aborts silently (no marker) if any item
   * cannot be placed outside the zone.
   */
  runBreadcrumbZoneMigration(
    parentId: string | null,
    blockedCells: Set<string>,
  ): Promise<{ relocated: number }>;
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
