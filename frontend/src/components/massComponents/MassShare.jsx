"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MassShare = ({ massId, className, iconOnly = false }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/home/mass/${massId}`
      : `https://example.com/home/mass/${massId}`;

  const handleCopyShareCode = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Mass link copied to clipboard");
    } catch {
      toast.error("Could not copy the mass link");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size={iconOnly ? "icon-sm" : "sm"}
        onClick={() => setShareDialogOpen(true)}
        className={"flex items-center gap-1 " + className}
      >
        <Share2 size={16} />
        {!iconOnly && "Share"}
        {iconOnly && <span className="sr-only">Share mass</span>}
      </Button>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-[#fff9] supports-backdrop-filter:backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Share Mass</DialogTitle>
            <DialogDescription>
              Scan this QR code or copy the code below to share this mass.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="bg-white p-3 rounded-lg ring-1 ring-slate-200">
              <QRCode value={shareUrl} size={180} />
            </div>
            <p className="text-xs text-slate-700 break-all text-center">
              {shareUrl}
            </p>
            <Button onClick={handleCopyShareCode}>Copy link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MassShare;
