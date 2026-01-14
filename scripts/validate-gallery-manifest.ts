#!/usr/bin/env bun
/**
 * Validates and normalizes a gallery manifest, fixing common agent errors:
 * - type → layout
 * - image indices → filenames
 * - note → notes
 *
 * Usage: bun scripts/validate-gallery-manifest.ts <manifest.json>
 */

const manifestPath = process.argv[2];

if (!manifestPath) {
  console.error("Usage: bun scripts/validate-gallery-manifest.ts <manifest.json>");
  process.exit(1);
}

const VALID_LAYOUTS = [
  "FullBleed",
  "WideImage",
  "TwoUp",
  "ThreeUp",
  "FourUp",
  "SplitLayout",
  "OffsetImage",
  "InsetImage",
  "Spacer",
  "Chapter",
];

interface RawBlock {
  layout?: string;
  type?: string;
  images?: (string | number)[];
  props?: Record<string, unknown>;
  notes?: string;
  note?: string;
}

interface NormalizedBlock {
  layout: string;
  images: string[];
  props: Record<string, unknown>;
  notes: string;
}

interface Manifest {
  gallery: string;
  title: string;
  slug: string;
  year: string;
  images: { filename: string }[];
  blocks: RawBlock[];
  lastReviewedIndex: number;
}

const file = Bun.file(manifestPath);
if (!(await file.exists())) {
  console.error(`File not found: ${manifestPath}`);
  process.exit(1);
}

const manifest: Manifest = await file.json();

let fixedCount = 0;
const errors: string[] = [];

const normalizedBlocks: NormalizedBlock[] = manifest.blocks.map((block, i) => {
  const fixes: string[] = [];

  // Fix type → layout
  let layout = block.layout || block.type;
  if (block.type && !block.layout) {
    fixes.push("type→layout");
  }

  // Validate layout value
  if (!layout) {
    errors.push(`Block ${i}: missing layout`);
    layout = "WideImage"; // fallback
  } else if (!VALID_LAYOUTS.includes(layout)) {
    errors.push(`Block ${i}: invalid layout "${layout}"`);
  }

  // Fix indices → filenames
  const images = (block.images || []).map((img) => {
    if (typeof img === "number") {
      fixes.push("index→filename");
      return manifest.images[img]?.filename || `UNKNOWN_${img}`;
    }
    return img;
  });

  // Fix note → notes
  let notes = block.notes || block.note || "";
  if (block.note && !block.notes) {
    fixes.push("note→notes");
  }

  if (fixes.length > 0) {
    fixedCount++;
    console.log(`Block ${i} (${layout}): fixed ${fixes.join(", ")}`);
  }

  return {
    layout,
    images,
    props: block.props || {},
    notes,
  };
});

// Update manifest with normalized blocks
manifest.blocks = normalizedBlocks as unknown as RawBlock[];

// Check for duplicate images
const seenImages = new Set<string>();
const duplicates: { blockIndex: number; image: string }[] = [];
for (let i = 0; i < normalizedBlocks.length; i++) {
  for (const image of normalizedBlocks[i].images) {
    if (seenImages.has(image)) {
      duplicates.push({ blockIndex: i, image });
    } else {
      seenImages.add(image);
    }
  }
}

// Report
console.log("");
if (duplicates.length > 0) {
  console.log("⚠️  Duplicate images found:");
  for (const { blockIndex, image } of duplicates) {
    const block = normalizedBlocks[blockIndex];
    console.log(`   Block ${blockIndex} (${block.layout}): ${image}`);
  }
  console.log("");
}

if (errors.length > 0) {
  console.log("⚠️  Errors:");
  errors.forEach((e) => console.log(`   ${e}`));
}

if (fixedCount > 0) {
  await Bun.write(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Fixed ${fixedCount} blocks, wrote ${manifestPath}`);
} else {
  console.log(`✅ Manifest valid: ${manifest.blocks.length} blocks, no fixes needed`);
}

// Summary stats
const layoutCounts: Record<string, number> = {};
for (const block of normalizedBlocks) {
  layoutCounts[block.layout] = (layoutCounts[block.layout] || 0) + 1;
}
console.log("\nLayout distribution:");
for (const [layout, count] of Object.entries(layoutCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${layout}: ${count}`);
}
