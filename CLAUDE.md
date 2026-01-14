# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

chu-gallery is a Claude Code plugin for AI-assisted photo gallery creation. It orchestrates EXIF extraction, image review (via sub-agents), and Astro page generation using layout principles from Keith Smith, Jörg Colberg, John Szarkowski, and Nathan Lyons.

## Commands

```bash
# Full gallery workflow (main entry point)
/gallery {folder} "{title}" {slug}
# Example: /gallery cabo-2025 "CABO 2025" cabo

# Individual scripts (all use bun)
bun scripts/init-gallery-manifest.ts {folder} "{title}" {slug}
bun scripts/merge-gallery-batches.ts {folder}
bun scripts/validate-gallery-manifest.ts src/data/gallery-manifests/{folder}.json
bun scripts/generate-gallery-files.ts {folder}

# Reusable skills
/extract-exif {path} {output.json}
/generate-astro-gallery {manifest.json}
/upload-to-r2 {files} {path}
```

## Architecture

```
Image Folder
    ↓
init-gallery-manifest.ts (EXIF extraction)
    ↓
gallery-manifest.json (images array, empty blocks)
    ↓
review-image-batch sub-agents (parallel, 8 images per batch)
    ↓
/tmp/gallery-batches/{folder}/batch-NN.json (isolated files)
    ↓
merge-gallery-batches.ts + validate-gallery-manifest.ts
    ↓
generate-gallery-files.ts → src/pages/photographing/{slug}/*.astro
```

**Key design**: Each batch file is isolated for parallel-safe sub-agent execution.

## File Locations

- Skills: `skills/{name}/SKILL.md`
- Layout reference: `skills/review-image-batch/references/layout-guide.md`
- Philosophy guide: `docs/photo-layout-principles.md`
- Scripts: `scripts/*.ts`
- Batch output: `/tmp/gallery-batches/{folder}/batch-NN.json`
- Manifests: `src/data/gallery-manifests/{folder}.json`
- Generated pages: `src/pages/photographing/{slug}/*.astro`

## Layout Principles

**80%+ single-image layouts** — Multi-image layouts are rare exceptions.

| Layout | Default? | Limit |
|--------|----------|-------|
| WideImage, OffsetImage | **YES** | Unlimited |
| FullBleed | Yes (hero) | 2-4/gallery |
| TwoUp | **NO** | Max 2-3 |
| ThreeUp | **NO** | Max 1-2 |
| SplitLayout, FourUp | **NO** | Max 0-1 |

**Lyons's Juxtaposition Test for TwoUp**: Only pair when juxtaposition creates meaning beyond either image alone (temporal, spatial, formal echo, or transformation).

**Visual Rhythm**: Vary intensity like music — never consecutive high-weight blocks.

## Sub-Agent Spawning

When spawning `review-image-batch` sub-agents:
1. Use `subagent_type: "general-purpose"`
2. Each batch reviews 8 images (indices `batchIndex * 8` to `min(start + 7, total - 1)`)
3. Output to `/tmp/gallery-batches/{folder}/batch-{NN}.json` (NN = zero-padded index)
4. Sub-agents return TEXT SUMMARY ONLY (no image data)

## Resume Protocol

Check existing batches: `ls /tmp/gallery-batches/{folder}/`

Only run missing batches, then merge.

## Prerequisites

- **bun** — Runtime for all scripts
- **exiftool** — EXIF extraction (`brew install exiftool`)
- **wrangler** — R2 upload (optional)
