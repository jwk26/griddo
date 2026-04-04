"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { EditNodeDialog } from "@/components/grid/edit-node-dialog";
import { GridView } from "@/components/grid/grid-view";
import { useAddFlow } from "@/components/layout/add-flow-context";
import { useDeleteFlow } from "@/components/layout/grid-runtime";
import { useNode } from "@/hooks/use-node";
import type { Node } from "@/types";

export default function NodeGridPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const node = useNode(nodeId);
  const { openAddAtCell } = useAddFlow();
  const { requestDelete } = useDeleteFlow();
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const displayLevel = (node?.level ?? 0) + 1;

  return (
    <>
      <h1 className="sr-only">{node?.title ?? "Grid"}</h1>
      <GridView
        level={displayLevel}
        onAddAtCell={openAddAtCell}
        onDelete={requestDelete}
        onNodeEditClick={setEditingNode}
        parentColor={node?.color}
        parentId={nodeId}
      />
      <EditNodeDialog
        node={editingNode}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNode(null);
          }
        }}
        open={editingNode !== null}
      />
    </>
  );
}
