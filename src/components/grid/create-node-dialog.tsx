"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRandomColor } from "@/lib/constants/color-palette";
import { DEFAULT_ICON, NODE_ICON_MAP, NODE_ICON_NAMES } from "@/lib/constants/node-icons";
import { cn } from "@/lib/utils";

type CreateNodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    title: string;
    description: string;
    icon: string;
    colorHex: string;
  }) => Promise<void>;
  error?: string;
};

export function CreateNodeDialog({
  open,
  onOpenChange,
  onSubmit,
  error,
}: CreateNodeDialogProps) {
  const titleId = useId();
  const titleErrorId = useId();
  const descriptionId = useId();
  const iconId = useId();
  const colorId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [colorHex, setColorHex] = useState(getRandomColor());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTitle("");
      setDescription("");
      setIcon(NODE_ICON_NAMES[Math.floor(Math.random() * NODE_ICON_NAMES.length)] ?? DEFAULT_ICON);
      setColorHex(getRandomColor());
      setIsSubmitting(false);
      setTitleError(false);
    } else if (!open) {
      setTitle("");
      setDescription("");
      setIsSubmitting(false);
      setTitleError(false);
    }

    prevOpenRef.current = open;
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length === 0) {
      setTitleError(true);
      return;
    }

    if (isSubmitting) {
      return;
    }

    setTitleError(false);
    setIsSubmitting(true);

    try {
      await onSubmit({ title, description, icon, colorHex });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Node</DialogTitle>
          <DialogDescription>
            Add a new node and place it in the nearest available cell.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={titleId}>
              Title
            </label>
            <Input
              autoFocus
              aria-describedby={titleErrorId}
              aria-invalid={titleError}
              id={titleId}
              maxLength={100}
              onChange={(event) => {
                setTitle(event.target.value);
                setTitleError(false);
              }}
              type="text"
              value={title}
            />
            <p id={titleErrorId} className="min-h-[1rem] text-sm text-destructive">
              {titleError ? "Title is required." : ""}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={descriptionId}>
              Description
            </label>
            <Textarea
              id={descriptionId}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
              value={description}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground" id={iconId}>
              Icon
            </div>
            <div
              aria-labelledby={iconId}
              className="grid grid-cols-5 gap-2 sm:grid-cols-6"
              role="radiogroup"
            >
              {NODE_ICON_NAMES.map((iconName) => {
                const Icon = NODE_ICON_MAP[iconName];
                const isSelected = iconName === icon;

                return (
                  <button
                    key={iconName}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${iconName} icon`}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2"
                        : "border-input hover:border-primary/50 hover:text-foreground",
                    )}
                    onClick={() => setIcon(iconName)}
                    title={iconName}
                    type="button"
                  >
                    <Icon aria-hidden={true} className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor={colorId}>
              Color
            </label>
            <Input
              className="h-10 cursor-pointer p-1"
              id={colorId}
              onChange={(event) => setColorHex(event.target.value)}
              type="color"
              value={colorHex}
            />
          </div>

          <p role="alert" className="min-h-[1.25rem] text-sm text-destructive">
            {error ?? ""}
          </p>

          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              Create Node
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
