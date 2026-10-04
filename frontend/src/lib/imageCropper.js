"use client";

/*
getCroppedBlob
receives: an image source (object URL or data URL), the pixel crop area
          returned by react-easy-crop, and output options.
does: draws the selected region of the source image onto a canvas at the
      requested output size and exports it as a Blob.
returns: Promise<Blob>
*/
export const getCroppedBlob = async (
  imageSrc,
  pixelCrop,
  {
    outputWidth = 1200,
    outputHeight = 400,
    mimeType = "image/jpeg",
    quality = 0.92,
  } = {},
) => {
  if (!imageSrc || !pixelCrop) {
    throw new Error("An image and crop area are required.");
  }

  const image = await new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load the image."));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create a canvas context.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export the cropped image."));
      },
      mimeType,
      quality,
    );
  });
};
