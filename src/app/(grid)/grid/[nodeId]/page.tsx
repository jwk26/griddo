"use client";

import { useParams } from "next/navigation";
import { NodeGridBody } from "@/components/layout/node-grid-body";
import { useNode } from "@/hooks/use-node";

export default function NodeGridPage() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const node = useNode(nodeId);

  return <NodeGridBody node={node} nodeId={nodeId} />;
}
