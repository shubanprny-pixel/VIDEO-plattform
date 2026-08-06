import "server-only";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateThumbnailFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("画像はPNG/JPEG/WebP形式のみアップロードできます");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("画像サイズは5MB以下にしてください");
  }
}
