"use client";

import { Loader2 } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone} onClick={onConfirm} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
