import { NodeGridShell } from "./_components/node-grid-shell";

export default async function GridPage({
  params,
}: {
  params: Promise<{ nodeId: string }>;
}) {
  const { nodeId } = await params;

  return <NodeGridShell nodeId={nodeId} />;
}
