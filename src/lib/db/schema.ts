import { z } from "zod";
import { GRID_COLS, GRID_ROWS } from "@/lib/constants";

// --- Shared ---

const idSchema = z.string().uuid();
const timestampSchema = z.number().int().positive();
const gridXSchema = z.number().int().min(0).max(GRID_COLS - 1);
const gridYSchema = z.number().int().min(0).max(GRID_ROWS - 1);

// --- Node ---

export const nodeSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(100),
  color: z.string().regex(/^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/),
  icon: z.string().min(1),
  deadline: timestampSchema.nullable().default(null),
  deadlineAllDay: z.boolean().default(false),
  mtime: timestampSchema,
  createdAt: timestampSchema,
  parentId: idSchema.nullable().default(null),
  level: z.number().int().min(0).max(2),
  x: gridXSchema,
  y: gridYSchema,
  deletedAt: timestampSchema.nullable().default(null),
  archivedAt: timestampSchema.nullable().default(null),
  systemRole: z.enum(["inbox", "archive_view"]).nullable().default(null),
  hiddenFromGrid: z.boolean().default(false),
});

export const createNodeSchema = nodeSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  deletedAt: true,
  archivedAt: true,
  systemRole: true,
  hiddenFromGrid: true,
});

export type Node = z.infer<typeof nodeSchema>;
export type CreateNode = z.infer<typeof createNodeSchema>;

// --- Bit ---

export const bitSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  icon: z.string().min(1),
  deadline: timestampSchema.nullable().default(null),
  deadlineAllDay: z.boolean().default(false),
  priority: z.enum(["high", "mid", "low"]).nullable().default(null),
  status: z.enum(["active", "complete"]).default("active"),
  mtime: timestampSchema,
  createdAt: timestampSchema,
  parentId: idSchema,
  x: gridXSchema,
  y: gridYSchema,
  deletedAt: timestampSchema.nullable().default(null),
  archivedAt: timestampSchema.nullable().default(null),
});

export const createBitSchema = bitSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  status: true,
  deletedAt: true,
  archivedAt: true,
});

export type Bit = z.infer<typeof bitSchema>;
export type CreateBit = z.infer<typeof createBitSchema>;

// --- Scratch Breakdown ---

export const scratchBreakdownSchema = z.object({
  id: idSchema,
  scratchBitId: idSchema,
  content: z.string().min(1).max(1000),
  order: z.number().int().min(0),
  createdAt: timestampSchema,
  consumedAt: timestampSchema.nullable().default(null),
});

export const createScratchBreakdownSchema = scratchBreakdownSchema.omit({
  id: true,
  createdAt: true,
  consumedAt: true,
});

export type ScratchBreakdown = z.infer<typeof scratchBreakdownSchema>;
export type CreateScratchBreakdown = z.infer<typeof createScratchBreakdownSchema>;

// --- Chunk ---

export const chunkSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(""),
  time: timestampSchema.nullable().default(null),
  timeAllDay: z.boolean().default(false),
  status: z.enum(["complete", "incomplete"]).default("incomplete"),
  order: z.number().int().min(0),
  parentId: idSchema,
});

export const createChunkSchema = chunkSchema.omit({
  id: true,
  status: true,
});

export type Chunk = z.infer<typeof chunkSchema>;
export type CreateChunk = z.infer<typeof createChunkSchema>;
