import sharp from 'sharp';
import { join } from 'path';
import { promises as fs } from 'fs';

interface ImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
}

/**
 * Generates responsive images (thumbnail, medium, large) optimized for retina and Next.js usage.
 * @param originalPath Path to the original uploaded image
 * @param tempDir Temporary folder to generate resized images
 * @param filename Filename of the image
 * @returns Relative paths to generated images inside tempDir
 */
export async function generateResponsiveImages(
  originalPath: string,
  tempDir: string,
  filename: string,
): Promise<ImageSizes> {
  // Ensure temp subfolders exist
  const thumbsDir = join(tempDir, 'thumbs');
  const mediumDir = join(tempDir, 'medium');
  const largeDir = join(tempDir, 'large');

  await fs.mkdir(thumbsDir, { recursive: true });
  await fs.mkdir(mediumDir, { recursive: true });
  await fs.mkdir(largeDir, { recursive: true });

  const thumbPath = join(thumbsDir, filename);
  const mediumPath = join(mediumDir, filename);
  const largePath = join(largeDir, filename);

  // Thumbnail — fast-loading grid preview
  await sharp(originalPath)
    .resize({ width: 480 }) // good for mobile + retina
    .webp({ quality: 75 })
    .toFile(thumbPath);

  // Medium — main gallery image (Next.js handles DPR)
  await sharp(originalPath)
    .resize({ width: 1280 }) // good balance for 2x retina mid-size
    .webp({ quality: 80 })
    .toFile(mediumPath);

  // Large — fullscreen modal / high-DPI retina displays
  await sharp(originalPath)
    .resize({ width: 2560 }) // covers 4K screens crisply
    .webp({ quality: 85 })
    .toFile(largePath);

  return {
    thumbnail: thumbPath,
    medium: mediumPath,
    large: largePath,
  };
}
