"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarView = "weekly" | "monthly";

type CalendarViewHeaderProps = {
  activeView: CalendarView;
  title: string;
  subtitle: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
};

export function CalendarViewHeader({
  activeView,
  title,
  subtitle,
  previousLabel,
  nextLabel,
  onPrevious,
  onToday,
  onNext,
}: CalendarViewHeaderProps) {
  return (
    <div
      className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6"
      data-testid="calendar-view-header"
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <span className="text-lg font-medium text-muted-foreground/50">
          {subtitle}
        </span>
      </div>

      <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
        <Button
          className="h-7 rounded-md px-4 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
          disabled
          size="sm"
          variant="ghost"
        >
          Day
        </Button>
        <Button
          asChild
          className={cn(
            "h-7 rounded-md px-4 text-xs font-medium transition-colors",
            activeView === "weekly"
              ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground"
              : "text-muted-foreground hover:bg-transparent hover:text-foreground",
          )}
          size="sm"
          variant="ghost"
        >
          <Link href="/calendar/weekly">Week</Link>
        </Button>
        <Button
          asChild
          className={cn(
            "h-7 rounded-md px-4 text-xs font-medium transition-colors",
            activeView === "monthly"
              ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground"
              : "text-muted-foreground hover:bg-transparent hover:text-foreground",
          )}
          size="sm"
          variant="ghost"
        >
          <Link href="/calendar/monthly">Month</Link>
        </Button>
        <Button
          className="h-7 rounded-md px-4 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
          disabled
          size="sm"
          variant="ghost"
        >
          Year
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          aria-label={previousLabel}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onPrevious}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          className="h-8 px-3 text-xs font-semibold text-foreground hover:bg-accent"
          onClick={onToday}
          size="sm"
          variant="ghost"
        >
          Today
        </Button>
        <Button
          aria-label={nextLabel}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onNext}
          size="icon-sm"
          variant="ghost"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
