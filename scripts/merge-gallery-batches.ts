#!/usr/bin/env bun
/**
 * Merge batch review files into the gallery manifest.
 * Reads all batch-NN.json files and combines blocks in order.
 *
 * Usage: bun scripts/merge-gallery-batches.ts <folder>
 * Example: bun scripts/merge-gallery-batches.ts merida-2026
 */

import { readdirSync } from "fs";
import { join } from "path";

const folder = process.argv[2];

if (!folder) {
  console.error("Usage: bun scripts/merge-gallery-batches.ts <folder>");
  process.exit(1);
}

const manifestPath = `src/data/gallery-manifests/${folder}.json`;
const batchDir = `/tmp/gallery-batches/${folder}`;

// Read manifest
const manifestFile = Bun.file(manifestPath);
if (!(await manifestFile.exists())) {
  console.error(`Manifest not found: ${manifestPath}`);
  console.error("Run init-gallery-manifest.ts first.");
  process.exit(1);
}

const manifest = await manifestFile.json();
const totalImages = manifest.images.length;
const expectedBatches = Math.ceil(totalImages / 8);

// Find batch files
let batchFiles: string[];
try {
  batchFiles = readdirSync(batchDir)
    .filter((f) => f.match(/^batch-\d+\.json$/))
    .sort();
} catch {
  console.error(`Batch directory not found: ${batchDir}`);
  console.error("Run batch reviews first.");
  process.exit(1);
}

if (batchFiles.length === 0) {
  console.error(`No batch files found in ${batchDir}`);
  process.exit(1);
}

console.log(`Found ${batchFiles.length}/${expectedBatches} batch files`);

// Check for missing batches
const foundIndices = new Set(
  batchFiles.map((f) => parseInt(f.match(/batch-(\d+)\.json/)?.[1] || "-1"))
);
const missingBatches: number[] = [];
for (let i = 0; i < expectedBatches; i++) {
  if (!foundIndices.has(i)) {
    missingBatches.push(i);
  }
}

if (missingBatches.length > 0) {
  console.warn(`⚠️  Missing batches: ${missingBatches.join(", ")}`);
  console.warn("   Some images will not have layout blocks.");
}

// Read and merge batches
interface Block {
  layout: string;
  images: string[];
  props: Record<string, unknown>;
  notes: string;
}

interface BatchFile {
  batchIndex: number;
  startImage: number;
  endImage: number;
  blocks: Block[];
}

const allBlocks: Block[] = [];
let totalBlockCount = 0;
const layoutCounts: Record<string, number> = {};

for (const file of batchFiles) {
  const batchPath = join(batchDir, file);
  const batch: BatchFile = await Bun.file(batchPath).json();

  console.log(`  ${file}: ${batch.blocks.length} blocks (images ${batch.startImage}-${batch.endImage})`);

  for (const block of batch.blocks) {
    allBlocks.push(block);
    layoutCounts[block.layout] = (layoutCounts[block.layout] || 0) + 1;
    totalBlockCount++;
  }
}

// Update manifest
manifest.blocks = allBlocks;

// Write updated manifest
await Bun.write(manifestPath, JSON.stringify(manifest, null, 2));

console.log("");
console.log(`✅ Merged ${totalBlockCount} blocks into ${manifestPath}`);
console.log("");
console.log("Layout distribution:");
for (const [layout, count] of Object.entries(layoutCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${layout}: ${count}`);
}

// Check composition
const singleImageLayouts = ["FullBleed", "WideImage", "OffsetImage", "InsetImage"];
const multiImageLayouts = ["TwoUp", "ThreeUp", "FourUp", "SplitLayout"];
const singleCount = singleImageLayouts.reduce((sum, l) => sum + (layoutCounts[l] || 0), 0);
const multiCount = multiImageLayouts.reduce((sum, l) => sum + (layoutCounts[l] || 0), 0);
const imageBlocks = singleCount + multiCount;

if (imageBlocks > 0) {
  const singlePct = Math.round((singleCount / imageBlocks) * 100);
  console.log("");
  console.log(`Single-image layouts: ${singlePct}% (target: 80%+)`);

  if (singlePct < 80) {
    console.warn("⚠️  Below 80% single-image target. Consider reducing multi-image layouts.");
  }

  // Check limits
  const twoUpCount = layoutCounts["TwoUp"] || 0;
  const threeUpCount = layoutCounts["ThreeUp"] || 0;
  const splitCount = layoutCounts["SplitLayout"] || 0;
  const fourUpCount = layoutCounts["FourUp"] || 0;

  if (twoUpCount > 3) console.warn(`⚠️  TwoUp: ${twoUpCount} (max recommended: 2-3)`);
  if (threeUpCount > 2) console.warn(`⚠️  ThreeUp: ${threeUpCount} (max recommended: 1-2)`);
  if (splitCount > 2) console.warn(`⚠️  SplitLayout: ${splitCount} (max recommended: 1-2)`);
  if (fourUpCount > 1) console.warn(`⚠️  FourUp: ${fourUpCount} (max recommended: 0-1)`);
}

console.log("");
console.log("Next: Validate and generate with:");
console.log(`  bun scripts/validate-gallery-manifest.ts src/data/gallery-manifests/${folder}.json`);
console.log(`  bun scripts/generate-gallery-files.ts ${folder}`);
