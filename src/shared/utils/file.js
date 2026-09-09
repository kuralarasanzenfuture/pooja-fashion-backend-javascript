import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..', '..');

/**
 * Convert string to safe filename/directory slug
 */
export const toSlug = (text) => {
  if (!text) return 'bank';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Delete a physical file given its relative or URL path (e.g. /uploads/banks/hdfc-bank/logo.png)
 */
export const deleteFileByUrl = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return false;
  }

  try {
    // Strip leading / if present
    const relativePath = fileUrl.replace(/^\//, '');
    const absolutePath = path.resolve(srcDir, relativePath);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
      return true;
    }
  } catch (error) {
    console.error(`Failed to delete file '${fileUrl}':`, error.message);
  }
  return false;
};

/**
 * Delete a directory and all its contents safely
 */
export const deleteDirectory = async (dirRelativePath) => {
  if (!dirRelativePath || typeof dirRelativePath !== 'string') {
    return false;
  }

  try {
    const relativePath = dirRelativePath.replace(/^\//, '');
    const absolutePath = path.resolve(srcDir, relativePath);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.rm(absolutePath, { recursive: true, force: true });
      return true;
    }
  } catch (error) {
    console.error(`Failed to delete directory '${dirRelativePath}':`, error.message);
  }
  return false;
};

export default {
  toSlug,
  deleteFileByUrl,
  deleteDirectory,
};
