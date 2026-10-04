"use client";
import { authClient } from "@/lib/authClient";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URI;

const authorizedHeaders = async () => {
  const { data } = await authClient.token();
  const headers = {};
  if (data?.token) headers.Authorization = `Bearer ${data.token}`;
  return headers;
};

/*
uploadImageFromClient
receives: { file, maxSize, folder, fileName, crop, signal }.
does: posts the file as multipart/form-data to the backend image upload
      route, which crops/compresses and stores it in Vercel Blob.
returns: { url, pathname, size, contentType, originalSize, compressed, cropped }
*/
export const uploadImageFromClient = async ({
  file,
  maxSize = 2 * 1024 * 1024,
  folder = "",
  fileName,
  crop,
  signal,
} = {}) => {
  if (!file) throw new Error("A file is required.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("maxSize", String(maxSize));
  if (folder) formData.append("folder", folder);
  if (fileName) formData.append("fileName", fileName);
  if (crop) formData.append("crop", JSON.stringify(crop));

  const response = await fetch(`${API_URL}/uploads/image`, {
    method: "POST",
    headers: await authorizedHeaders(),
    credentials: "include",
    body: formData,
    signal,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to upload image.");
  }
  return payload;
};
