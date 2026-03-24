import { GridView } from "@/components/grid/grid-view";
import { OnboardingHints } from "@/components/grid/onboarding-hints";
import { Sidebar } from "@/components/layout/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar level={0} />
      <main className="relative ml-[14rem] flex-1 overflow-auto p-4">
        <h1 className="sr-only">GridDO</h1>
        <GridView parentId={null} level={0} />
        <OnboardingHints />
      </main>
    </div>
  );
}
