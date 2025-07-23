import fs from "fs/promises";

export async function deleteFile(path: string) {
  try {
    await fs.unlink(path);
  } catch (err) {
    console.error("Failed to delete file:", err);
  }
}
