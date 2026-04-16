"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { addDays, format, isSameDay, isToday, startOfDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DeadlineValue = {
  deadline: number | null;
  deadlineAllDay: boolean;
};

interface DateFirstDeadlinePickerProps {
  value: DeadlineValue;
  onChange: (value: DeadlineValue) => void;
  onClear?: () => void;
}

const pillClasses = {
  base:
    "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  inactive: "bg-secondary text-muted-foreground hover:bg-secondary/80",
  active: "bg-primary text-primary-foreground",
};

const iconButtonClasses =
  "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const timeInputClasses =
  "h-8 w-14 rounded-md border border-input bg-background px-2 text-center text-sm tabular-nums text-foreground outline-none transition-[box-shadow,border-color] focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function parseTimePart(value: string, max: number): number | null {
  if (!/^\d{1,2}$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > max) {
    return null;
  }

  return parsed;
}

function getTimeDraft(value: DeadlineValue): { hour: string; minute: string } {
  if (value.deadline === null || value.deadlineAllDay) {
    return { hour: "", minute: "" };
  }

  const current = new Date(value.deadline);
  return {
    hour: String(current.getHours()),
    minute: current.getMinutes().toString().padStart(2, "0"),
  };
}

function getDeadlineDate(value: DeadlineValue): Date {
  if (value.deadline === null) {
    return startOfToday();
  }

  return new Date(value.deadline);
}

export function DateFirstDeadlinePicker({
  value,
  onChange,
  onClear,
}: DateFirstDeadlinePickerProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const hourInputRef = useRef<HTMLInputElement>(null);
  const currentDate = value.deadline === null ? null : new Date(value.deadline);
  const todayDate = startOfToday();
  const weekDate = addDays(todayDate, 7);
  const isTodayShortcut = value.deadline !== null &&
    currentDate !== null &&
    isToday(currentDate);
  const isWeekShortcut = value.deadline !== null &&
    currentDate !== null &&
    isSameDay(currentDate, weekDate);
  const showDatePill = value.deadline !== null && !(isTodayShortcut || isWeekShortcut);
  const showTimePill = value.deadline !== null && !value.deadlineAllDay;
  const formattedDate = currentDate ? format(currentDate, "MMM d") : null;
  const formattedTime = showTimePill && currentDate ? format(currentDate, "h:mm a") : null;

  function applyShortcut(offsetDays: number) {
    const date = addDays(startOfToday(), offsetDays);
    onChange({
      deadline: date.getTime(),
      deadlineAllDay: true,
    });
  }

  function handleDateSelect(selected: Date | undefined) {
    if (!selected) {
      return;
    }

    onChange({
      deadline: startOfDay(selected).getTime(),
      deadlineAllDay: true,
    });
    setIsDateOpen(false);
  }

  function applyTime(nextHour: string, nextMinute: string): boolean {
    const parsedHour = parseTimePart(nextHour, 23);
    const parsedMinute = parseTimePart(nextMinute, 59);

    if (parsedHour === null || parsedMinute === null) {
      return false;
    }

    const nextDate = new Date(getDeadlineDate(value));
    nextDate.setHours(parsedHour, parsedMinute, 0, 0);
    onChange({
      deadline: nextDate.getTime(),
      deadlineAllDay: false,
    });
    return true;
  }

  function handleTimeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    applyTime(hour, minute);
    setIsTimeOpen(false);
  }

  function handleTimeOpenChange(open: boolean) {
    setIsTimeOpen(open);

    if (!open) {
      return;
    }

    const draft = getTimeDraft(value);
    setHour(draft.hour);
    setMinute(draft.minute);
    queueMicrotask(() => hourInputRef.current?.focus());
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        aria-pressed={isTodayShortcut}
        className={cn(
          pillClasses.base,
          isTodayShortcut ? pillClasses.active : pillClasses.inactive,
        )}
        onClick={() => applyShortcut(0)}
        type="button"
      >
        Today
      </button>

      <button
        aria-pressed={isWeekShortcut}
        className={cn(
          pillClasses.base,
          isWeekShortcut ? pillClasses.active : pillClasses.inactive,
        )}
        onClick={() => applyShortcut(7)}
        type="button"
      >
        Week
      </button>

      <Popover onOpenChange={setIsDateOpen} open={isDateOpen}>
        <PopoverTrigger asChild={true}>
          {showDatePill && formattedDate ? (
            <button
              className={cn(pillClasses.base, pillClasses.active)}
              type="button"
            >
              {formattedDate}
            </button>
          ) : (
            <button aria-label="Pick date" className={iconButtonClasses} type="button">
              <CalendarIcon className="h-4 w-4" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-xl border border-border p-0 shadow-xl"
        >
          <Calendar
            mode="single"
            onSelect={handleDateSelect}
            selected={currentDate ?? undefined}
          />
        </PopoverContent>
      </Popover>

      <Popover onOpenChange={handleTimeOpenChange} open={isTimeOpen}>
        <PopoverTrigger asChild={true}>
          {showTimePill && formattedTime ? (
            <button
              className={cn(pillClasses.base, pillClasses.active, "tabular-nums")}
              type="button"
            >
              <Clock className="h-4 w-4" />
              {formattedTime}
            </button>
          ) : (
            <button aria-label="Pick time" className={iconButtonClasses} type="button">
              <Clock className="h-4 w-4" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-xl border border-border p-3 shadow-xl"
        >
          <div className="flex items-center gap-2" onKeyDown={handleTimeKeyDown}>
            <input
              ref={hourInputRef}
              aria-label="Hour"
              autoComplete="off"
              className={timeInputClasses}
              inputMode="numeric"
              max={23}
              min={0}
              onChange={(event) => {
                const nextHour = event.target.value.slice(0, 2);
                setHour(nextHour);
                applyTime(nextHour, minute);
              }}
              placeholder="HH"
              type="number"
              value={hour}
            />
            <span className="text-sm font-medium text-muted-foreground">:</span>
            <input
              aria-label="Minute"
              autoComplete="off"
              className={timeInputClasses}
              inputMode="numeric"
              max={59}
              min={0}
              onChange={(event) => {
                const nextMinute = event.target.value.slice(0, 2);
                setMinute(nextMinute);
                applyTime(hour, nextMinute);
              }}
              placeholder="MM"
              type="number"
              value={minute}
            />
          </div>
        </PopoverContent>
      </Popover>

      {value.deadline !== null ? (
        <button
          aria-label="Clear deadline"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => {
            if (onClear) {
              onClear();
              return;
            }

            onChange({ deadline: null, deadlineAllDay: false });
          }}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
