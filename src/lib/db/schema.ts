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
});

export const createNodeSchema = nodeSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  deletedAt: true,
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
});

export const createBitSchema = bitSchema.omit({
  id: true,
  mtime: true,
  createdAt: true,
  status: true,
  deletedAt: true,
});

export type Bit = z.infer<typeof bitSchema>;
export type CreateBit = z.infer<typeof createBitSchema>;

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
