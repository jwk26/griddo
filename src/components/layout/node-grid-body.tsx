"use client";

import { useState } from "react";
import { EditNodeDialog } from "@/components/grid/edit-node-dialog";
import { GridView } from "@/components/grid/grid-view";
import { useAddFlow } from "@/components/layout/add-flow-context";
import { useDeleteFlow } from "@/components/layout/grid-runtime";
import type { Node } from "@/types";

export function NodeGridBody({
  node,
  nodeId,
}: {
  node: Node | null | undefined;
  nodeId: string;
}) {
  if (node?.systemRole !== null && node?.systemRole !== undefined) {
    return null;
  }

  return <StandardNodeGrid node={node} nodeId={nodeId} />;
}

function StandardNodeGrid({
  node,
  nodeId,
}: {
  node: Node | null | undefined;
  nodeId: string;
}) {
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
        level={editingNode?.level ?? 0}
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
