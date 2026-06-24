"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarViewHeaderProps = {
  title: string;
  subtitle: string;
  previousLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
};

export function CalendarViewHeader({
  title,
  subtitle,
  previousLabel,
  nextLabel,
  onPrev,
  onToday,
  onNext,
}: CalendarViewHeaderProps) {
  const pathname = usePathname();
  const isMonthlyRoute = pathname === "/calendar/monthly";

  return (
    <header
      aria-label="Calendar navigation"
      className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6"
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-xl font-bold tracking-tight text-foreground">{title}</span>
        <span className="text-lg font-medium text-muted-foreground/50">{subtitle}</span>
      </div>
      <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
        <Button
          asChild
          className={cn(
            "h-7 rounded-md px-3 text-xs font-medium transition-all",
            isMonthlyRoute
              ? "text-muted-foreground hover:bg-transparent hover:text-foreground"
              : "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground",
          )}
          size="sm"
          variant="ghost"
        >
          <Link href="/calendar/weekly">Weekly</Link>
        </Button>
        <Button
          asChild
          className={cn(
            "h-7 rounded-md px-3 text-xs font-medium transition-all",
            isMonthlyRoute
              ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground"
              : "text-muted-foreground hover:bg-transparent hover:text-foreground",
          )}
          size="sm"
          variant="ghost"
        >
          <Link href="/calendar/monthly">Monthly</Link>
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button
          aria-label={previousLabel}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          size="icon-sm"
          variant="ghost"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          className="h-8 px-3 text-xs font-semibold text-foreground hover:bg-accent"
          variant="ghost"
          onClick={onToday}
        >
          Today
        </Button>
        <Button
          aria-label={nextLabel}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          size="icon-sm"
          variant="ghost"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
