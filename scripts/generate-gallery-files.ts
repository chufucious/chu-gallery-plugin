#!/usr/bin/env bun
/**
 * Generate Astro gallery files from a manifest.
 * Creates data file (.ts) and page file(s) (.astro).
 * Handles multi-chapter galleries with separate pages.
 *
 * Usage: bun scripts/generate-gallery-files.ts <folder>
 * Example: bun scripts/generate-gallery-files.ts merida-2026
 */

import { $ } from "bun";

const folder = process.argv[2];

if (!folder) {
  console.error("Usage: bun scripts/generate-gallery-files.ts <folder>");
  process.exit(1);
}

const manifestPath = `src/data/gallery-manifests/${folder}.json`;

// Read manifest
const manifestFile = Bun.file(manifestPath);
if (!(await manifestFile.exists())) {
  console.error(`Manifest not found: ${manifestPath}`);
  process.exit(1);
}

interface Block {
  layout: string;
  images: string[];
  props: Record<string, any>;
  notes: string;
}

interface Manifest {
  gallery: string;
  title: string;
  slug: string;
  year: string;
  sourceFolder?: string; // Where images live (may differ from gallery for versions)
  images: { filename: string }[];
  blocks: Block[];
}

const manifest: Manifest = await manifestFile.json();

// Determine where images actually live (sourceFolder for versioned, otherwise gallery name)
const imageFolder = manifest.sourceFolder || manifest.gallery;

if (manifest.blocks.length === 0) {
  console.error("Manifest has no blocks. Run batch reviews and merge first.");
  process.exit(1);
}

// Extract chapters from blocks
interface ChapterData {
  name: string;
  slug: string;
  href: string;
  blocks: Block[];
}

const chapters: ChapterData[] = [];
let currentChapter: ChapterData | null = null;
let blocksBeforeFirstChapter: Block[] = [];

for (const block of manifest.blocks) {
  if (block.layout === "Chapter") {
    // Start new chapter
    if (currentChapter) {
      chapters.push(currentChapter);
    }
    currentChapter = {
      name: block.props.name as string,
      slug: block.props.slug as string,
      href: block.props.slug === "/" ? "/" : (block.props.slug as string),
      blocks: [],
    };
  } else if (currentChapter) {
    currentChapter.blocks.push(block);
  } else {
    blocksBeforeFirstChapter.push(block);
  }
}

// Push final chapter
if (currentChapter) {
  chapters.push(currentChapter);
}

// If there are blocks before first Chapter, create implicit first chapter
if (blocksBeforeFirstChapter.length > 0 && chapters.length > 0) {
  // Insert as first chapter with slug "/"
  chapters.unshift({
    name: "Part I", // Generic name - could be customized
    slug: "/",
    href: "/",
    blocks: blocksBeforeFirstChapter,
  });
}

// If no chapters at all, treat as single-page gallery
const hasChapters = chapters.length > 0;
if (!hasChapters) {
  chapters.push({
    name: manifest.title,
    slug: "/",
    href: "/",
    blocks: blocksBeforeFirstChapter.concat(manifest.blocks),
  });
}

// Generate data file
const dataFilePath = `src/data/${folder}.ts`;
const chaptersArray = hasChapters
  ? chapters.map((c) => `  { name: "${c.name}", href: "${c.href}" },`).join("\n")
  : "";

const dataFileContent = `import type { Chapter } from "../consts";

export const title = "${manifest.title}";
export const chapters: Chapter[] = [
${chaptersArray}
];
`;

await Bun.write(dataFilePath, dataFileContent);
console.log(`✅ Data file: ${dataFilePath}`);

// Create page directory
const pageDir = `src/pages/photographing/${manifest.slug}`;
await $`mkdir -p ${pageDir}`;

// Helper to generate import name from filename
function toImportName(filename: string, index: number): string {
  // Remove extension and convert to camelCase-ish
  const base = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "");
  return `img${String(index).padStart(3, "0")}`;
}

// Helper to generate component code for a block
function generateBlockCode(block: Block, imageImports: Map<string, string>): string {
  const { layout, images } = block;
  const props = block.props || {};

  switch (layout) {
    case "FullBleed":
    case "WideImage": {
      const imgVar = imageImports.get(images[0]);
      const priority = props.priority ? " priority={true}" : "";
      return `  <${layout === "FullBleed" ? "FullBleedImage" : "WideImage"} src={${imgVar}} alt=""${priority} />`;
    }

    case "OffsetImage": {
      const imgVar = imageImports.get(images[0]);
      const align = props.align ? ` align="${props.align}"` : "";
      const size = props.size ? ` size="${props.size}"` : "";
      const priority = props.priority ? " priority={true}" : "";
      return `  <OffsetImage src={${imgVar}} alt=""${align}${size}${priority} />`;
    }

    case "InsetImage": {
      const imgVar = imageImports.get(images[0]);
      const priority = props.priority ? " priority={true}" : "";
      return `  <InsetImage src={${imgVar}} alt=""${priority} />`;
    }

    case "Spacer": {
      const size = props.size ? ` size="${props.size}"` : "";
      return `  <Spacer${size} />`;
    }

    case "TwoUp":
    case "ThreeUp":
    case "FourUp": {
      const componentName =
        layout === "TwoUp" ? "TwoUpLayout" : layout === "ThreeUp" ? "ThreeUpLayout" : "FourUpGrid";
      const imgArray = images.map((img) => `    { src: ${imageImports.get(img)}, alt: "" },`).join("\n");
      return `  <${componentName} images={[\n${imgArray}\n  ]} />`;
    }

    case "SplitLayout": {
      const imgArray = images.map((img) => `    { src: ${imageImports.get(img)}, alt: "" },`).join("\n");
      const ratio = props.ratio ? ` ratio="${props.ratio}"` : "";
      return `  <SplitLayout images={[\n${imgArray}\n  ]}${ratio} />`;
    }

    case "Chapter":
      // Chapters are structural, not rendered
      return "";

    default:
      console.warn(`Unknown layout: ${layout}`);
      return `  {/* Unknown layout: ${layout} */}`;
  }
}

// Helper to get prev/next navigation for a chapter
function getChapterNavigation(chapterIndex: number): { prevHref?: string; nextHref?: string } {
  const prev = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const next = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;
  return {
    prevHref: prev ? (prev.slug === "/" ? "/" : prev.slug) : undefined,
    nextHref: next ? (next.slug === "/" ? "/" : next.slug) : undefined,
  };
}

// Generate page for each chapter
for (let i = 0; i < chapters.length; i++) {
  const chapter = chapters[i];
  const isFirst = i === 0;
  const pageFilename = chapter.slug === "/" ? "index.astro" : `${chapter.slug}.astro`;
  const pagePath = `${pageDir}/${pageFilename}`;
  const { prevHref, nextHref } = getChapterNavigation(i);

  // Collect unique images for this chapter
  const chapterImages = new Set<string>();
  for (const block of chapter.blocks) {
    for (const img of block.images) {
      chapterImages.add(img);
    }
  }

  // Create import map
  const imageImports = new Map<string, string>();
  let importIndex = 0;
  for (const img of chapterImages) {
    imageImports.set(img, toImportName(img, importIndex++));
  }

  // Generate imports
  const importLines = Array.from(imageImports.entries())
    .map(([filename, varName]) => `import ${varName} from "../../../assets/images/photos/${imageFolder}/${filename}";`)
    .join("\n");

  // Determine which components are used
  const usedLayouts = new Set(chapter.blocks.map((b) => b.layout));
  const componentImports: string[] = [];
  if (usedLayouts.has("FullBleed")) componentImports.push("FullBleedImage");
  if (usedLayouts.has("WideImage")) componentImports.push("WideImage");
  if (usedLayouts.has("TwoUp")) componentImports.push("TwoUpLayout");
  if (usedLayouts.has("ThreeUp")) componentImports.push("ThreeUpLayout");
  if (usedLayouts.has("FourUp")) componentImports.push("FourUpGrid");
  if (usedLayouts.has("SplitLayout")) componentImports.push("SplitLayout");
  if (usedLayouts.has("OffsetImage")) componentImports.push("OffsetImage");
  if (usedLayouts.has("InsetImage")) componentImports.push("InsetImage");
  if (usedLayouts.has("Spacer")) componentImports.push("Spacer");

  // Generate block code
  const blockCode = chapter.blocks
    .map((block) => generateBlockCode(block, imageImports))
    .filter((code) => code.length > 0)
    .join("\n\n");

  // Mark first image as priority if not already
  let finalBlockCode = blockCode;
  if (isFirst && !blockCode.includes("priority={true}")) {
    // Add priority to first FullBleed or WideImage
    finalBlockCode = blockCode.replace(
      /(<(?:FullBleedImage|WideImage) src=\{[^}]+\} alt="")(?: \/>)/,
      "$1 priority={true} />"
    );
  }

  // Build navigation props string
  const navProps: string[] = [];
  if (prevHref) navProps.push(`prevHref="${prevHref}"`);
  if (nextHref) navProps.push(`nextHref="${nextHref}"`);
  navProps.push("currentPath={Astro.url.pathname}");
  navProps.push("chapters={chapters}");
  navProps.push("client:load");

  // Generate page content
  const pageContent = `---
import BaseLayout from "../../../layouts/BaseLayout.astro";
import BottomNavigation from "../../../components/BottomNavigation.svelte";
import {
  ${componentImports.join(",\n  ")}
} from "../../../components/photos";
import { title, chapters } from "../../../data/${folder}";
import { getPageTitle } from "../../../lib/navigation";

const pageTitle = getPageTitle(title, Astro.url.pathname, chapters);

${importLines}
---

<BaseLayout title={pageTitle} navTitle={title} chapters={chapters}>
${finalBlockCode}

  <BottomNavigation ${navProps.join(" ")} />
</BaseLayout>
`;

  await Bun.write(pagePath, pageContent);
  console.log(`✅ Page file: ${pagePath}`);
}

// Summary
console.log("");
console.log(`Gallery generated: /photographing/${manifest.slug}/`);
if (hasChapters) {
  console.log(`Chapters: ${chapters.map((c) => c.name).join(", ")}`);
}
console.log(`Total blocks: ${manifest.blocks.length}`);
