import { put } from "@vercel/blob";
import sharp from "sharp";

const MAX_ATTEMPTS = 40;
const MIN_WIDTH = 64;
const QUALITY_STEPS = [85, 75, 65, 55, 45, 35, 25];
const RESIZE_FACTOR = 0.8;

const MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/tiff": "tiff",
};

/*
toBuffer
receives: a Buffer, a multer-style file ({ buffer, mimetype }), a base64
          string, or a data URL.
returns: { buffer, mimeType } where mimeType may be null when unknown.
*/
const toBuffer = (input) => {
  if (Buffer.isBuffer(input)) return { buffer: input, mimeType: null };

  if (input && Buffer.isBuffer(input.buffer)) {
    return { buffer: input.buffer, mimeType: input.mimetype || null };
  }

  if (typeof input === "string") {
    const dataUrlMatch = input.match(/^data:(.+?);base64,(.+)$/);
    if (dataUrlMatch) {
      return {
        buffer: Buffer.from(dataUrlMatch[2], "base64"),
        mimeType: dataUrlMatch[1],
      };
    }
    return { buffer: Buffer.from(input, "base64"), mimeType: null };
  }

  if (input && typeof input.arrayBuffer === "function") {
    // Blob / File in edge-ish runtimes is not awaited here; Buffer path only.
    throw new Error("Pass a Buffer or a multer-style file object.");
  }

  throw new Error(
    "Unsupported image input. Provide a Buffer, { buffer, mimetype }, base64, or data URL.",
  );
};

const probeImage = async (buffer) => {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions.");
  }
  return metadata;
};

/*
compressToTarget
receives: the source buffer, its declared mime type and a byte budget.
does: reduces quality first, then downscales once quality is exhausted,
      re-encoding until the buffer fits or options run out. PNG sources are
      converted to WebP (keeps transparency); everything else to mozjpeg JPEG.
returns: { buffer, contentType }
*/
const compressToTarget = async (sourceBuffer, mimeType, maxSize) => {
  const metadata = await probeImage(sourceBuffer);
  const isPng = mimeType === "image/png";
  const contentType = isPng ? "image/webp" : "image/jpeg";

  let width = metadata.width;
  let qualityIndex = 0;
  let attempt = 0;
  let current = sourceBuffer;

  while (attempt < MAX_ATTEMPTS) {
    const pipeline = sharp(sourceBuffer).rotate();

    if (width < metadata.width) {
      pipeline.resize({ width, withoutEnlargement: true });
    }

    if (contentType === "image/webp") {
      pipeline.webp({ quality: QUALITY_STEPS[qualityIndex], effort: 6 });
    } else {
      pipeline.jpeg({ quality: QUALITY_STEPS[qualityIndex], mozjpeg: true });
    }

    current = await pipeline.toBuffer();
    if (current.length <= maxSize) return { buffer: current, contentType };

    attempt += 1;

    if (qualityIndex < QUALITY_STEPS.length - 1) {
      qualityIndex += 1;
    } else if (width > MIN_WIDTH) {
      width = Math.floor(width * RESIZE_FACTOR);
      qualityIndex = 0;
    } else {
      break;
    }
  }

  if (current.length > maxSize) {
    throw new Error(
      `Could not compress image below ${maxSize} bytes (final size ${current.length} bytes).`,
    );
  }

  return { buffer: current, contentType };
};

/*
parseAspectRatio
receives: "3:1" or { width, height } or a number (width/height).
returns: { width, height } in its simplest integer ratio, or null.
*/
const parseAspectRatio = (aspectRatio) => {
  if (!aspectRatio) return null;

  if (typeof aspectRatio === "number") {
    return aspectRatio > 0 ? { width: aspectRatio, height: 1 } : null;
  }

  if (typeof aspectRatio === "object") {
    const w = Number(aspectRatio.width);
    const h = Number(aspectRatio.height);
    return w > 0 && h > 0 ? { width: w, height: h } : null;
  }

  const match = String(aspectRatio).match(/^(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  return w > 0 && h > 0 ? { width: w, height: h } : null;
};

/*
cropToAspect
receives: a source buffer and a crop descriptor:
          { aspectRatio: "3:1", width: 1200 } — width is the target pixel width.
does: center/attention crops the image to the requested aspect ratio using
      "cover" so edges are trimmed rather than stretched. Output width
      defaults to the requested width, capped to the source width.
returns: { buffer, contentType }
*/
const cropToAspect = async (sourceBuffer, crop) => {
  const ratio = parseAspectRatio(crop?.aspectRatio);
  if (!ratio) {
    throw new Error('crop.aspectRatio must be like "3:1", 3, or { width, height }.');
  }

  const metadata = await probeImage(sourceBuffer);
  const targetWidth = Math.min(
    Number(crop?.width) > 0 ? Number(crop.width) : metadata.width,
    metadata.width,
  );
  const targetHeight = Math.max(
    1,
    Math.round((targetWidth * ratio.height) / ratio.width),
  );

  const buffer = await sharp(sourceBuffer)
    .rotate()
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "cover",
      position: crop?.position || "attention",
      withoutEnlargement: false,
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  return { buffer, contentType: "image/jpeg" };
};

const resolvePathname = (folder, fileName) => {
  const cleanFolder = String(folder || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\\/g, "/");
  const cleanName = String(fileName || "").replace(/^\/+/, "");
  return cleanFolder ? `${cleanFolder}/${cleanName}` : cleanName;
};

/*
uploadImage
input:   Buffer | { buffer, mimetype } | base64 string | data URL.
options:
  - maxSize        (required) maximum size in bytes after compression.
  - folder         (optional) folder/prefix inside the store.
  - fileName       (required) file name including extension.
  - mimeType       (optional) overrides the detected mime type.
  - crop           (optional) { aspectRatio: "3:1", width: 1200 } crops before
                   compressing. width is the target output width in pixels.
  - access         (optional) "public" (default) or "private".
  - storeId        (optional) defaults to process.env.EDB_STORE_ID.
  - token          (optional) defaults to process.env.EDB_READ_WRITE_TOKEN.
  - allowOverwrite (optional) defaults to true.
returns: { url, pathname, size, contentType, originalSize, compressed, cropped }
*/
const uploadImage = async (input, options = {}) => {
  const {
    maxSize,
    folder = "",
    fileName,
    mimeType,
    crop,
    access = "public",
    storeId = process.env.EDB_STORE_ID,
    token = process.env.EDB_READ_WRITE_TOKEN,
    allowOverwrite = true,
  } = options;

  if (typeof maxSize !== "number" || maxSize <= 0) {
    throw new Error("A positive numeric maxSize (in bytes) is required.");
  }
  if (!fileName) {
    throw new Error("A fileName is required.");
  }
  if (!token) {
    throw new Error("Missing EDB_READ_WRITE_TOKEN (or token option).");
  }

  const normalized = toBuffer(input);
  const detectedMime = mimeType || normalized.mimeType || null;
  const originalSize = normalized.buffer.length;

  let bufferToUpload = normalized.buffer;
  let contentType = detectedMime;
  let compressed = false;
  let cropped = false;

  if (crop) {
    const cropResult = await cropToAspect(normalized.buffer, crop);
    bufferToUpload = cropResult.buffer;
    contentType = cropResult.contentType;
    cropped = true;
  }

  if (bufferToUpload.length > maxSize) {
    const result = await compressToTarget(bufferToUpload, contentType, maxSize);
    bufferToUpload = result.buffer;
    contentType = result.contentType;
    compressed = true;
  }

  if (!contentType) {
    const metadata = await probeImage(bufferToUpload);
    const extension = metadata.format === "jpeg" ? "image/jpeg" : null;
    contentType = extension || `image/${metadata.format}`;
  }

  const pathname = resolvePathname(folder, fileName);

  const result = await put(pathname, bufferToUpload, {
    access,
    allowOverwrite,
    contentType,
    token,
    ...(storeId ? { storeId } : {}),
  });

  return {
    url: result.url,
    pathname: result.pathname,
    size: bufferToUpload.length,
    contentType,
    originalSize,
    compressed,
    cropped,
  };
};

export {
  uploadImage,
  compressToTarget,
  cropToAspect,
  parseAspectRatio,
  toBuffer,
  probeImage,
  MIME_EXTENSIONS,
};
export default uploadImage;
