#!/usr/bin/env bun
/**
 * Initialize a gallery manifest from EXIF data.
 * Creates manifest with images array and empty blocks.
 *
 * Usage: bun scripts/init-gallery-manifest.ts <folder> <title> <slug>
 * Example: bun scripts/init-gallery-manifest.ts merida-2026 "MÉRIDA 2026" merida
 */

import { $ } from "bun";

const [folder, title, slug] = process.argv.slice(2);

if (!folder || !title || !slug) {
  console.error("Usage: bun scripts/init-gallery-manifest.ts <folder> <title> <slug>");
  console.error("Example: bun scripts/init-gallery-manifest.ts merida-2026 \"MÉRIDA 2026\" merida");
  process.exit(1);
}

const imageDir = `src/assets/images/photos/${folder}`;
const manifestPath = `src/data/gallery-manifests/${folder}.json`;
const batchDir = `/tmp/gallery-batches/${folder}`;

// Check if image directory exists
const dirExists = await Bun.file(imageDir).exists().catch(() => false);
if (!dirExists) {
  // Try to list the directory to check
  try {
    const files = await $`ls ${imageDir}`.text();
    if (!files.trim()) {
      console.error(`No images found in ${imageDir}`);
      process.exit(1);
    }
  } catch {
    console.error(`Image directory not found: ${imageDir}`);
    process.exit(1);
  }
}

// Extract EXIF data
console.log(`Extracting EXIF from ${imageDir}...`);
let exifData: any[];
try {
  const result = await $`exiftool -ImageWidth -ImageHeight -DateTimeOriginal -json ${imageDir}/*.jpeg`.json();
  exifData = result;
} catch (e) {
  console.error("Failed to extract EXIF data. Is exiftool installed?");
  process.exit(1);
}

// Transform to manifest format
const images = exifData.map((img: any) => ({
  filename: img.SourceFile.split("/").pop(),
  width: img.ImageWidth,
  height: img.ImageHeight,
  aspect: +(img.ImageWidth / img.ImageHeight).toFixed(2),
  orientation: img.ImageWidth > img.ImageHeight ? "landscape" : "portrait",
  timestamp: img.DateTimeOriginal || null,
}));

// Sort by filename to ensure consistent ordering
images.sort((a, b) => a.filename.localeCompare(b.filename));

const manifest = {
  gallery: folder,
  title,
  slug,
  year: new Date().getFullYear().toString(),
  images,
  blocks: [],
};

// Create directories
await $`mkdir -p src/data/gallery-manifests`;
await $`mkdir -p ${batchDir}`;

// Clean up any existing batch files
await $`rm -f ${batchDir}/batch-*.json`.catch(() => {});

// Write manifest
await Bun.write(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Manifest created: ${manifestPath}`);
console.log(`   Images: ${images.length}`);
console.log(`   Batch dir: ${batchDir}`);
console.log(`   Batches needed: ${Math.ceil(images.length / 8)}`);
console.log("");
console.log("Next: Run batch reviews, then merge with:");
console.log(`  bun scripts/merge-gallery-batches.ts ${folder}`);
