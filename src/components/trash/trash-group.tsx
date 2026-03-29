"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getDataStore } from "@/lib/db/datastore";
import { TRASH_RETENTION_DAYS } from "@/lib/constants";
import { NODE_ICON_MAP } from "@/lib/constants/node-icons";
import { cn } from "@/lib/utils";
import type { Bit, Node } from "@/types";

type TrashGroupProps =
  | {
      kind: "node";
      node: Node;
      childBits: Bit[];
    }
  | {
      kind: "bit";
      bit: Bit;
    };

function getDaysRemaining(deletedAt: number | null): number {
  if (deletedAt === null) {
    return TRASH_RETENTION_DAYS;
  }

  return Math.max(
    0,
    Math.ceil((deletedAt + TRASH_RETENTION_DAYS * 86_400_000 - Date.now()) / 86_400_000),
  );
}

function getRetentionLabel(deletedAt: number | null): string {
  const daysRemaining = getDaysRemaining(deletedAt);
  return daysRemaining === 0 ? "Expires today" : `${daysRemaining}d left`;
}

function TrashGroupFrame({
  actions,
  children,
  color,
  deletedAt,
  iconName,
  metadata,
  title,
}: {
  actions: React.ReactNode;
  children?: React.ReactNode;
  color: string;
  deletedAt: number | null;
  iconName: string;
  metadata?: React.ReactNode;
  title: string;
}) {
  const Icon = NODE_ICON_MAP[iconName] ?? NODE_ICON_MAP.Folder;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="mt-1 h-3 w-3 rounded-full border border-border"
          style={{ backgroundColor: color }}
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <Icon aria-hidden="true" className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className={getDaysRemaining(deletedAt) === 0 ? "text-destructive" : undefined}>{getRetentionLabel(deletedAt)}</span>
            {deletedAt ? (
              <span>Deleted {formatDistanceToNow(new Date(deletedAt), { addSuffix: true })}</span>
            ) : null}
            {metadata}
          </div>
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      {children}
    </section>
  );
}

function NodeTrashGroup({ childBits, node }: { childBits: Bit[]; node: Node }) {
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleRestore() {
    try {
      const dataStore = await getDataStore();
      await dataStore.restoreNode(node.id);
      toast.success("Node restored.");
    } catch (error) {
      if (error instanceof Error && error.message === "GRID_FULL") {
        toast.error("Parent grid is full. Free up space first.");
        return;
      }

      toast.error("Unable to restore node.");
    }
  }

  async function handlePermanentDelete() {
    try {
      const dataStore = await getDataStore();
      await dataStore.hardDeleteNode(node.id);
      toast.success("Node permanently deleted.");
    } catch {
      toast.error("Unable to permanently delete node.");
    }
  }

  return (
    <TrashGroupFrame
      actions={(
        <>
          <Button size="sm" variant="outline" onClick={() => void handleRestore()} type="button">
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" type="button">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this node and its trashed descendants.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => void handlePermanentDelete()}>
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      color={node.color}
      deletedAt={node.deletedAt}
      iconName={node.icon}
      metadata={(
        <>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {childBits.length} {childBits.length === 1 ? "bit" : "bits"}
          </span>
          <button
            aria-expanded={isExpanded}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-accent hover:text-foreground",
            )}
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {isExpanded ? "Hide children" : "Show children"}
          </button>
        </>
      )}
      title={node.title}
    >
      {isExpanded && childBits.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {childBits.map((bit) => {
            const Icon = NODE_ICON_MAP[bit.icon] ?? NODE_ICON_MAP.Box;

            return (
              <div
                key={bit.id}
                className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2"
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-sm text-foreground">{bit.title}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </TrashGroupFrame>
  );
}

function StandaloneBitTrashGroup({ bit }: { bit: Bit }) {
  async function handleRestore() {
    try {
      const dataStore = await getDataStore();
      await dataStore.restoreBit(bit.id);
      toast.success("Bit restored.");
    } catch (error) {
      if (error instanceof Error && error.message === "GRID_FULL") {
        toast.error("Parent grid is full. Free up space first.");
        return;
      }

      toast.error("Unable to restore bit.");
    }
  }

  async function handlePermanentDelete() {
    try {
      const dataStore = await getDataStore();
      await dataStore.hardDeleteBit(bit.id);
      toast.success("Bit permanently deleted.");
    } catch {
      toast.error("Unable to permanently delete bit.");
    }
  }

  return (
    <TrashGroupFrame
      actions={(
        <>
          <Button size="sm" variant="outline" onClick={() => void handleRestore()} type="button">
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" type="button">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this bit and its steps.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => void handlePermanentDelete()}>
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      color="hsl(var(--border))"
      deletedAt={bit.deletedAt}
      iconName={bit.icon}
      title={bit.title}
    />
  );
}

export function TrashGroup(props: TrashGroupProps) {
  if (props.kind === "node") {
    return <NodeTrashGroup childBits={props.childBits} node={props.node} />;
  }

  return <StandaloneBitTrashGroup bit={props.bit} />;
}
