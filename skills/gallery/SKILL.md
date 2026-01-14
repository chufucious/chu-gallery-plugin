---
name: gallery
description: Create photo galleries with AI-assisted layout curation. Orchestrates atomic scripts and sub-agents. Use when user wants to create a gallery from photos, mentions "/gallery", or asks about photo layout and sequencing.
---

# Gallery Workflow

Composed skill that creates photo galleries by orchestrating atomic scripts and sub-agents.

## Philosophy

This skill applies principles from masters of photo sequencing and curation:

- **Keith Smith** — Group/Series/Sequence taxonomy; the gallery as a unified experience
- **Jörg Colberg** — Ruthless editing; visual rhythm; pacing
- **John Szarkowski** — The Five Characteristics for image assessment

> "The individual pages have to give up their independence in order to form a union." — Keith Smith

For detailed principles, see `docs/photo-layout-principles.md`.

## Usage

`/gallery {folder} "{title}" {slug}`

Example: `/gallery cabo-2025 "CABO 2025" cabo`

## Gallery Modes

Before starting, identify the gallery's organizational mode:

| Mode | Definition | Implication |
|------|------------|-------------|
| **Series** | Chronological journey (default) | Respect timestamp order; adjust only within temporal clusters |
| **Group** | Thematic collection | Order is flexible; optimize for visual rhythm |
| **Sequence** | Strict order with meaning | Order is sacred; only adjust layout, not arrangement |

Most travel/event galleries are **Series**.

## Architecture

```
Atomic Scripts (reusable):
├── init-gallery-manifest.ts    Create manifest from EXIF
├── merge-gallery-batches.ts    Combine batch files
├── validate-gallery-manifest.ts Fix common errors
└── generate-gallery-files.ts   Generate .astro pages

Sub-Agent Skill:
└── review-image-batch          AI reviews images → batch-NN.json
```

## Workflow

### Phase 1: Initialize

```bash
bun scripts/init-gallery-manifest.ts {folder} "{title}" {slug}
```

Creates:
- `src/data/gallery-manifests/{folder}.json` (images array, empty blocks)
- `/tmp/gallery-batches/{folder}/` (clean directory for batch files)

### Phase 2: Batch Review

Spawn sub-agents to review images. **Each writes to its own file** (parallel-safe).

```
For batchIndex in 0..ceil(imageCount/8):
  Task(
    subagent_type: "general-purpose",
    description: "Review gallery batch {batchIndex}",
    prompt: <see below>
  )
```

**Sub-agent prompt template:**

```
Review batch {batchIndex} for {folder} gallery.

Read:
- Manifest: src/data/gallery-manifests/{folder}.json
- Layout guide: ~/.claude/skills/review-image-batch/references/layout-guide.md

Images to review: indices {startImage} to {endImage}
(Calculate: startImage = batchIndex * 8, endImage = min(startImage + 7, totalImages - 1))

Workflow:
1. Read manifest to get image filenames
2. Read layout guide for rules
3. View each image file with Read tool
4. Create layout blocks (80%+ single-image!)
5. Write JSON to: /tmp/gallery-batches/{folder}/batch-{NN}.json
   where NN = batchIndex padded to 2 digits (00, 01, 02...)
6. Return TEXT SUMMARY ONLY

Output file format:
{
  "batchIndex": {batchIndex},
  "startImage": {startImage},
  "endImage": {endImage},
  "blocks": [
    { "layout": "WideImage", "images": ["DSCF1234.jpeg"], "props": {}, "notes": "..." }
  ]
}

CRITICAL:
- Default to single-image layouts (WideImage, OffsetImage)
- Multi-image layouts (TwoUp, ThreeUp) are RARE - max 2-3 TwoUp for entire gallery
- Look for Chapter breaks at location/theme changes
```

**Parallel execution:** Sub-agents can run in parallel since each writes to its own file.

### Phase 3: Merge & Validate

After all batches complete:

```bash
bun scripts/merge-gallery-batches.ts {folder}
bun scripts/validate-gallery-manifest.ts src/data/gallery-manifests/{folder}.json
```

This combines all batch files and validates the result.

### Phase 4: Global Arc Review (NEW)

Before generating, review the merged manifest for overall coherence:

1. **Count hero moments** — If >4 FullBleeds, demote some to WideImage
2. **Check multi-image limits** — Max 2-3 TwoUp, 1-2 ThreeUp across entire gallery
3. **Verify rhythm** — No consecutive high-weight blocks
4. **Identify the climax** — One clear emotional peak, not many
5. **Working backwards** — Does the final image provide satisfying closure?

### Phase 5: Generate

```bash
bun scripts/generate-gallery-files.ts {folder}
```

Creates:
- `src/data/{folder}.ts` (data file with chapters)
- `src/pages/photographing/{slug}/index.astro`
- Additional `.astro` files for each chapter (if multi-chapter)

## Resume Protocol

If interrupted, check `/tmp/gallery-batches/{folder}/` for existing batch files:

```bash
ls /tmp/gallery-batches/{folder}/
```

Only run missing batches, then merge.

## Layout Philosophy

**80%+ single-image layouts.** Multi-image layouts are rare exceptions.

| Layout | Default? | Limit |
|--------|----------|-------|
| WideImage | **YES** | Unlimited |
| OffsetImage | **YES** | Unlimited |
| FullBleed | Yes (hero) | 2-4 per gallery |
| Spacer | Yes | As needed |
| TwoUp | **NO** | Max 2-3 |
| ThreeUp | **NO** | Max 1-2 |
| SplitLayout | **NO** | Max 1-2 |
| FourUp | **NO** | Max 0-1 |
| Chapter | Special | As needed |

### Lyons's Juxtaposition Test for TwoUp

Only pair images when juxtaposition creates meaning beyond either image alone:

1. **Temporal** — Within minutes, same moment
2. **Spatial** — Same scene, different angle
3. **Formal echo** — Compositional rhyme (lines, shapes, colors)
4. **Emotional pairing** — Contrast or reinforcement
5. **Transformation** — Together they say something neither says alone

If none apply, use WideImage × 2 instead of TwoUp.

## Output

When complete:
- Gallery URL: `/photographing/{slug}/`
- Files:
  - `src/data/gallery-manifests/{folder}.json`
  - `src/data/{folder}.ts`
  - `src/pages/photographing/{slug}/*.astro`

## Composability

Each piece is reusable:

```bash
# Just extract EXIF
bun scripts/init-gallery-manifest.ts photos "Photos" photos

# Just merge existing batches
bun scripts/merge-gallery-batches.ts photos

# Just regenerate pages from manifest
bun scripts/generate-gallery-files.ts photos

# Validate any manifest
bun scripts/validate-gallery-manifest.ts src/data/gallery-manifests/photos.json
```
