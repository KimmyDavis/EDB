"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadImageFromClient } from "@/lib/imageUploadClient";
import { getCroppedBlob } from "@/lib/imageCropper";

const ASPECT_RATIO = 3; // width / height -> locked 3:1
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 400;
const MAX_SIZE = 1024 * 1024; // 1 MB

export default function EventBannerField({ value, onChange, eventCode }) {
  const fieldPickerRef = useRef(null);
  const dialogPickerRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState("banner.jpg");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // release the object URL when it changes or the component unmounts
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const openCropperForFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setImageSrc((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setImageName(file.name || "banner.jpg");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropDialogOpen(true);
  };

  const closeCropper = () => {
    setCropDialogOpen(false);
    setImageSrc((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setCroppedAreaPixels(null);
  };

  const onCropComplete = (_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, {
        outputWidth: OUTPUT_WIDTH,
        outputHeight: OUTPUT_HEIGHT,
        mimeType: "image/jpeg",
        quality: 0.92,
      });

      const baseName = imageName
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-");
      const fileName = `${
        eventCode && eventCode !== "new" ? eventCode : baseName || Date.now()
      }.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const result = await uploadImageFromClient({
        file,
        maxSize: MAX_SIZE,
        folder: "events/banners",
        fileName,
      });

      onChange(result.url);
      toast.success("Banner uploaded.");
      closeCropper();
    } catch (error) {
      toast.error(error.message || "Failed to upload banner.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 px-3">
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-300 bg-slate-100">
        <div className="relative aspect-[3/1] w-full">
          {value ? (
            <Image
              src={value}
              alt="Event banner preview"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImagePlus className="h-8 w-8" />
              <span className="text-xs">3:1 banner preview</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={fieldPickerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            openCropperForFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fieldPickerRef.current?.click()}
          className="flex items-center gap-1"
        >
          <ImagePlus className="h-4 w-4" />
          {value ? "Replace banner" : "Upload banner"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Drag to reposition, scroll to zoom. The crop is locked to a 3:1 ratio
        and exported at {OUTPUT_WIDTH}×{OUTPUT_HEIGHT}.
      </p>

      <Dialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open && !uploading) closeCropper();
        }}
      >
        <DialogContent className="max-w-11/12 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop banner (3:1)</DialogTitle>
          </DialogHeader>

          <div className="relative h-[55vh] w-full overflow-hidden rounded-lg bg-slate-900">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIO}
                cropShape="rect"
                showGrid={false}
                minZoom={1}
                maxZoom={3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
            {uploading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white">
                <LoaderCircle className="h-7 w-7 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-theme-gold"
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <input
              ref={dialogPickerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                openCropperForFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => dialogPickerRef.current?.click()}
            >
              Choose different image
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={closeCropper}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={uploading || !croppedAreaPixels}
                onClick={handleApplyCrop}
                className="flex items-center gap-1"
              >
                {uploading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Apply Crop
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
