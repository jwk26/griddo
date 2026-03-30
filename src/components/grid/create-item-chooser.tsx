"use client";

import { CheckSquare, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateItemChooserProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseNode: () => void;
  onChooseBit: () => void;
};

export function CreateItemChooser({
  open,
  onOpenChange,
  onChooseNode,
  onChooseBit,
}: CreateItemChooserProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 pt-1">
          <Button
            className="flex h-20 flex-1 flex-col gap-2"
            variant="outline"
            onClick={() => { onOpenChange(false); onChooseNode(); }}
          >
            <Folder className="h-6 w-6" />
            <span className="text-sm">Node</span>
          </Button>
          <Button
            className="flex h-20 flex-1 flex-col gap-2"
            variant="outline"
            onClick={() => { onOpenChange(false); onChooseBit(); }}
          >
            <CheckSquare className="h-6 w-6" />
            <span className="text-sm">Bit</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
