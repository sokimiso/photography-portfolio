import sharp from 'sharp';
import { join } from 'path';
import { promises as fs } from 'fs';

interface ImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
}

/**
 * Generates responsive images (thumbnail, medium, large) from an original file.
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

  // Generate thumbnail (300px width)
  await sharp(originalPath)
    .resize({ width: 300 })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  // Medium (600px width)
  await sharp(originalPath)
    .resize({ width: 600 })
    .webp({ quality: 85 })
    .toFile(mediumPath);

  // Large (1200px width)
  await sharp(originalPath)
    .resize({ width: 1200 })
    .webp({ quality: 90 })
    .toFile(largePath);

  return {
    thumbnail: thumbPath,
    medium: mediumPath,
    large: largePath,
  };
}
