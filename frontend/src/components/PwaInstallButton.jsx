"use client";
import { useState } from "react";
import { Download, Share, MoreVertical, PlusSquare, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function PwaInstallButton() {
  const { isStandalone, canNativeInstall, triggerInstall } = usePwaInstall();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Hide when app is already installed / running as PWA
  if (isStandalone) return null;

  return (
    <>
      <Button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="w-full flex items-center gap-2 bg-theme-gold/30 hover:bg-theme-gold/50 text-primary"
        variant="ghost"
      >
        <Download size={16} />
        <span>Install App</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Install EDB App</DialogTitle>
            <DialogDescription>
              Add this app to your home screen or desktop for quick access,
              even offline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-foreground">
            {/* Native install button — Chrome / Edge / Android Chrome */}
            {canNativeInstall && (
              <Button
                className="w-full bg-theme-gold hover:bg-theme-gold/70"
                onClick={() => {
                  triggerInstall();
                  setDialogOpen(false);
                }}
              >
                <Download size={15} className="mr-2" />
                Install now
              </Button>
            )}

            {/* Desktop Chrome / Edge */}
            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Monitor size={15} className="shrink-0" />
                Desktop (Chrome / Edge)
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground leading-relaxed">
                <li>
                  Look for the <strong>install icon</strong> (
                  <Monitor size={12} className="inline" />) in the address bar
                  on the right side.
                </li>
                <li>
                  Click it and select <strong>"Install"</strong>.
                </li>
                <li>
                  Alternatively, open the browser<strong> menu ⋮ </strong>→{" "}
                  <strong>"Save and share"</strong> →{" "}
                  <strong>"Install EDB App"</strong>.
                </li>
              </ol>
            </div>

            {/* iOS / Safari */}
            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Share size={15} className="shrink-0" />
                iPhone / iPad (Safari)
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground leading-relaxed">
                <li>
                  Tap the <strong>Share</strong> button{" "}
                  <Share size={12} className="inline" /> at the bottom of
                  Safari.
                </li>
                <li>
                  Scroll down and tap{" "}
                  <strong>"Add to Home Screen"</strong>{" "}
                  <PlusSquare size={12} className="inline" />.
                </li>
                <li>
                  Tap <strong>"Add"</strong> in the top-right corner.
                </li>
              </ol>
            </div>

            {/* Android (Samsung / Firefox) */}
            <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <MoreVertical size={15} className="shrink-0" />
                Android (Samsung Internet / Firefox)
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground leading-relaxed">
                <li>
                  Tap the <strong>menu</strong>{" "}
                  <MoreVertical size={12} className="inline" /> button (three
                  dots or lines) in your browser.
                </li>
                <li>
                  Tap <strong>"Add to Home Screen"</strong> or{" "}
                  <strong>"Install App"</strong>.
                </li>
                <li>Confirm when prompted.</li>
              </ol>
            </div>
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}
