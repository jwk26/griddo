"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type PendingDelete = {
  id: string;
  type: "node" | "bit";
  title: string;
} | null;

type DeleteConfirmDialogProps = {
  pendingDelete: PendingDelete;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmDialog({
  pendingDelete,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const isOpen = pendingDelete !== null;
  const description =
    pendingDelete?.type === "node"
      ? "This will also delete all its child nodes and bits."
      : "This action cannot be undone.";

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {pendingDelete ? `Delete '${pendingDelete.title}'?` : "Delete item?"}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} variant="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
