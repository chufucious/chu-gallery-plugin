---
name: review-image-batch
description: Review a batch of images and output layout suggestions to an isolated batch file. Designed for parallel execution - each batch writes to its own file.
---

# Review Image Batch

Sub-agent skill for reviewing images and outputting layout blocks to an isolated file.

## Philosophy

Apply Szarkowski's Five Characteristics when assessing each image:

| Characteristic | Question to Ask |
|----------------|-----------------|
| **The Thing Itself** | What is the essential subject? What reality is captured? |
| **The Detail** | What fragments carry symbolic weight? |
| **The Frame** | What's included/excluded? How does framing create meaning? |
| **Time** | What moment is captured? Decisive or contemplative? |
| **Vantage Point** | How does position redistribute power/relationships? |

This vocabulary helps explain *why* an image deserves a particular layout.

## Key Design: Isolated Output

Each batch writes to its **own file** - no shared state, safe for parallel execution.

```
/tmp/gallery-batches/{folder}/
├── batch-00.json  ← from batch 0
├── batch-01.json  ← from batch 1
├── batch-02.json  ← from batch 2
└── ...
```

## Usage

Invoked via Task tool from `/gallery` workflow:

```
Task(
  subagent_type: "general-purpose",
  prompt: "Review batch {N} for {folder} gallery..."
)
```

## Inputs

The sub-agent receives:
- `folder`: Gallery folder name
- `batchIndex`: Which batch (0, 1, 2, ...)
- `batchSize`: Images per batch (default 8)

## Workflow

1. **Read manifest** at `src/data/gallery-manifests/{folder}.json`
2. **Read layout guide** at `~/.claude/skills/review-image-batch/references/layout-guide.md`
3. **Calculate image range**: `startImage = batchIndex * batchSize`
4. **View images** using Read tool on each image file
5. **Create layout blocks** following the guide (80%+ single-image!)
6. **Write batch file** to `/tmp/gallery-batches/{folder}/batch-{NN}.json`
7. **Return text summary** only (no image data in response)

## Output File Format

```json
{
  "batchIndex": 0,
  "startImage": 0,
  "endImage": 7,
  "blocks": [
    {
      "layout": "FullBleed",
      "images": ["DSCF9023.jpeg"],
      "props": { "priority": true },
      "notes": "Hero opener - kid with binoculars",
      "visualWeight": "high"
    },
    {
      "layout": "Spacer",
      "images": [],
      "props": { "size": "small" },
      "notes": "Breathing room after hero",
      "visualWeight": "rest"
    },
    {
      "layout": "WideImage",
      "images": ["DSCF9029.jpeg"],
      "props": {},
      "notes": "Joyful portrait - strong frame, decisive moment",
      "visualWeight": "medium"
    }
  ]
}
```

## Layout Types

| Layout | Images | When to Use |
|--------|--------|-------------|
| **FullBleed** | 1 | Hero shots, openers (max 2-4 per gallery) |
| **WideImage** | 1 | Strong standalone ← **DEFAULT CHOICE** |
| **OffsetImage** | 1 | Verticals, quiet moments |
| **InsetImage** | 1 | Maximum restraint, intimate |
| **Spacer** | 0 | Visual pause, breathing room |
| **Chapter** | 0 | Start new page section |

**RARE (use sparingly across entire gallery):**

| Layout | Images | Limit |
|--------|--------|-------|
| TwoUp | 2 | MAX 2-3 per gallery |
| ThreeUp | 3 | MAX 1-2 per gallery |
| SplitLayout | 2 | MAX 1-2 per gallery |
| FourUp | 4 | MAX 0-1 per gallery |

## Visual Weight Tracking

Track the weight of each block to ensure rhythm:

| Weight | Layouts |
|--------|---------|
| `high` | FullBleed |
| `medium` | WideImage, TwoUp, ThreeUp, SplitLayout |
| `low` | OffsetImage, InsetImage |
| `rest` | Spacer |

**Rule:** Never place consecutive `high` or `medium` blocks without a `low` or `rest` between.

## Critical Rules

1. **Default to single-image layouts** - 80%+ should be WideImage/OffsetImage/FullBleed
2. **Multi-image layouts are RARE** - only with EXTRAORDINARY reason
3. **"Related" is NOT enough** - images must lose meaning if separated
4. **Vertical images → OffsetImage**, not forced into pairs
5. **After FullBleed, add Spacer** for breathing room
6. **Look for Chapter breaks** - location/time/theme changes

### Lyons's Juxtaposition Test for TwoUp

Only pair when juxtaposition transforms meaning:
- Truly simultaneous moment?
- One frames the other?
- Formal echo (lines, shapes, colors)?
- Emotional contrast/reinforcement?

If unsure, **don't pair**.

## Block Schema

**Required fields:**

| Field | Type | Description |
|-------|------|-------------|
| `layout` | string | Component name (FullBleed, WideImage, etc.) |
| `images` | string[] | Filenames (not indices!) |
| `props` | object | Component props (can be `{}`) |
| `notes` | string | Brief description using Szarkowski vocabulary |

**Optional fields:**

| Field | Type | Description |
|-------|------|-------------|
| `visualWeight` | string | `high`, `medium`, `low`, `rest` |

## Example Response

```
Batch 2 complete. Reviewed images 16-23.

Created 7 blocks:
- WideImage: Street scene with pink building (strong frame, environmental)
- OffsetImage(left): Vertical portrait of vendor (intimate vantage)
- WideImage: Market stall with fruit (rich detail)
- Spacer(medium): Transition pause
- Chapter: "Uxmal" - location change detected (timestamp gap: 3 hours)
- FullBleed: Pyramid establishing shot (decisive moment, low vantage)
- WideImage: Carved stone detail (the detail characteristic)

Visual rhythm: medium → low → medium → rest → (break) → high → medium

Wrote to /tmp/gallery-batches/merida-2026/batch-02.json
```

## Composability

This skill is atomic and reusable:
- Used by `/gallery` for batch review phase
- Can review any set of images independently
- Output format works with `merge-gallery-batches.ts` script

## Reference

For detailed layout guidance, pairing rules, and rhythm patterns:
→ Read `references/layout-guide.md`
