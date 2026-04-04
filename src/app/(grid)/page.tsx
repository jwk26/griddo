"use client";

import { GridView } from "@/components/grid/grid-view";
import { OnboardingHints } from "@/components/grid/onboarding-hints";
import { useAddFlow } from "@/components/layout/add-flow-context";
import { useDeleteFlow } from "@/components/layout/grid-runtime";

export default function HomePage() {
  const { openAddAtCell } = useAddFlow();
  const { requestDelete } = useDeleteFlow();

  return (
    <>
      <h1 className="sr-only">GridDO</h1>
      <GridView
        level={0}
        onAddAtCell={openAddAtCell}
        onDelete={requestDelete}
        parentId={null}
      />
      <OnboardingHints />
    </>
  );
}
