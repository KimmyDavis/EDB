import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { User } from "../models/usersModel.js";
import { checkJwt } from "../middleware/verifyJWT.js";
import { uploadImage } from "../utils/imageUploader.js";

const router = express.Router();

const EDITOR_ROLES = ["admin", "liturgy", "media"];
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // hard cap on the incoming file

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const getUserId = (req) =>
  req.auth?.sub || req.auth?.id || req.auth?.userId || null;

const isEditor = async (userId) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return false;
  const user = await User.findById(userId).select("role").lean();
  return Boolean(user) && EDITOR_ROLES.includes(user.role);
};

const parseCrop = (value) => {
  if (!value) return undefined;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/*
POST /uploads/image
multipart/form-data with:
  - file       (required) the image
  - maxSize    (optional) byte budget after compression, defaults to 2MB
  - folder     (optional) store folder/prefix
  - fileName   (optional) defaults to a timestamped name
  - crop       (optional) JSON string like {"aspectRatio":"3:1","width":1200}
returns: { url, pathname, size, contentType, originalSize, compressed, cropped }
*/
const uploadImageHandler = async (req, res) => {
  const userId = getUserId(req);
  if (!(await isEditor(userId))) {
    return res
      .status(403)
      .json({ message: "Only editors can upload images." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "An image file is required." });
  }
  if (!req.file.mimetype?.startsWith("image/")) {
    return res.status(400).json({ message: "Only image files are allowed." });
  }

  const maxSize = req.body.maxSize ? Number(req.body.maxSize) : 2 * 1024 * 1024;
  if (!Number.isFinite(maxSize) || maxSize <= 0) {
    return res.status(400).json({ message: "Invalid maxSize." });
  }

  const crop = parseCrop(req.body.crop);
  const fileName =
    req.body.fileName ||
    `${Date.now()}-${(req.file.originalname || "image")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .slice(0, 60)}.jpg`;

  try {
    const result = await uploadImage(
      { buffer: req.file.buffer, mimetype: req.file.mimetype },
      {
        maxSize,
        folder: req.body.folder || "",
        fileName,
        crop,
      },
    );
    return res.status(201).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to upload image." });
  }
};

router.use(checkJwt);
router.post("/image", upload.single("file"), uploadImageHandler);

export default router;
