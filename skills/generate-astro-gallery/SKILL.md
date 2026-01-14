---
name: generate-astro-gallery
description: Generate Astro page files from an existing gallery manifest. Internal step of /gallery workflow - use directly only to regenerate from completed manifests.
---

# Generate Astro Gallery

Generates Astro gallery files from a completed manifest. This is typically the final step of `/gallery` workflow.

## Prerequisites

- Manifest file at `src/data/gallery-manifests/{folder}.json` with all blocks populated
- Images already in `src/assets/images/photos/{folder}/`

## Usage

`/generate-astro-gallery {manifest.json}`

Example: `/generate-astro-gallery src/data/gallery-manifests/cabo-2025.json`

## Workflow

### 1. Read Manifest & Validate

1. Read the manifest file
2. **Read `~/.claude/skills/review-image-batch/references/layout-guide.md`** to understand component constraints
3. **Run validation/normalization to fix common agent errors**

```json
{
  "gallery": "cabo-2025",
  "title": "CABO 2025",
  "slug": "cabo",
  "year": "2025",
  "images": [...],
  "blocks": [...]
}
```

### Manifest Validation (REQUIRED)

Before generating, run the validation script to fix common agent errors:

```bash
bun scripts/validate-gallery-manifest.ts src/data/gallery-manifests/{folder}.json
```

This script automatically fixes:
- `type` → `layout`
- Image indices → filenames
- `note` → `notes`

And validates layout values are valid component names.

### 2. Generate Data File

Create `src/data/{folder}.ts`:

```typescript
import type { Chapter } from "../consts";

export const title = "{TITLE}";
export const chapters: Chapter[] = [];
```

For multi-chapter galleries:
```typescript
export const chapters: Chapter[] = [
  { name: "CH I", href: "/" },
  { name: "CH II", href: "part2" },
];
```

### 3. Generate Page File

Create `src/pages/photographing/{slug}/index.astro`:

```astro
---
import BaseLayout from "../../../layouts/BaseLayout.astro";
import {
  FullBleedImage,
  WideImage,
  TwoUpLayout,
  ThreeUpLayout,
  FourUpGrid,
  SplitLayout,
  OffsetImage,
  InsetImage,
  Spacer
} from "../../../components/photos";
import { title, chapters } from "../../../data/{folder}";
import { getPageTitle } from "../../../lib/navigation";

const pageTitle = getPageTitle(title, Astro.url.pathname, chapters);

// Image imports - one per image in manifest
import img001 from "../../../assets/images/photos/{folder}/DSCF1234.jpeg";
import img002 from "../../../assets/images/photos/{folder}/DSCF1235.jpeg";
// ...
---

<BaseLayout title={pageTitle} navTitle={title} chapters={chapters}>
  <!-- Layout blocks from manifest -->
</BaseLayout>
```

### 4. Update Gallery Index

Add entry to `src/pages/photographing/~/index.astro`:

```astro
<a href="/photographing/{slug}/">{TITLE}</a>
```

## Layout Component Mapping

| Manifest Layout | Astro Component | Image Count | Props |
|----------------|-----------------|-------------|-------|
| FullBleed | `<FullBleedImage>` | 1 | `priority` |
| WideImage | `<WideImage>` | 1 | `priority` |
| TwoUp | `<TwoUpLayout>` | 2 | — |
| ThreeUp | `<ThreeUpLayout>` | 3 | — |
| FourUp | `<FourUpGrid>` | 4 | — |
| SplitLayout | `<SplitLayout>` | 2 | `ratio` |
| **OffsetImage** | `<OffsetImage>` | 1 | `align`, `size`, `priority` |
| **InsetImage** | `<InsetImage>` | 1 | `priority` |
| **Spacer** | `<Spacer>` | 0 | `size` (small/medium/large/xl) |
| **Chapter** | *(structural)* | 0 | `name`, `slug` - splits into pages |

## Component Props Reference

```astro
<!-- Single image layouts -->
<FullBleedImage src={img} alt="description" priority={true} />
<WideImage src={img} alt="description" />

<!-- Whitespace components -->
<OffsetImage src={img} alt="description" align="left" size="medium" />
<OffsetImage src={img} alt="description" align="right" size="small" priority={true} />
<InsetImage src={img} alt="description" />
<InsetImage src={img} alt="description" priority={true} />
<Spacer size="medium" />

<!-- Multi-image layouts -->
<TwoUpLayout images={[
  { src: img1, alt: "description 1" },
  { src: img2, alt: "description 2" },
]} />

<ThreeUpLayout images={[
  { src: img1, alt: "description 1" },
  { src: img2, alt: "description 2" },
  { src: img3, alt: "description 3" },
]} />

<FourUpGrid images={[
  { src: img1, alt: "description 1" },
  { src: img2, alt: "description 2" },
  { src: img3, alt: "description 3" },
  { src: img4, alt: "description 4" },
]} />

<SplitLayout
  images={[
    { src: img1, alt: "description 1" },
    { src: img2, alt: "description 2" },
  ]}
  ratio="2/3"
/>
```

## Handling Block Props

When a block has `props` in the manifest, pass them to the component:

Manifest:
```json
{
  "layout": "OffsetImage",
  "images": ["portrait.jpeg"],
  "props": { "align": "left", "size": "small" }
}
```

Generated:
```astro
<OffsetImage src={portrait} alt="..." align="left" size="small" />
```

## Import Naming Convention

Generate semantic import names from block notes:
- Block notes: "sunset hero shot over the bay"
- Import name: `sunsetHero` or `baySunset`

Or use sequential naming: `img001`, `img002`, etc.

## First Image Priority

Add `priority={true}` to the first `<FullBleedImage>` or `<WideImage>` to preload above-the-fold content.

## Composability

This skill is used by:
- `/gallery` - Final step after batch review is complete
- Can be used standalone to regenerate pages from existing manifests

---

## Multi-Chapter Galleries

When manifest contains `Chapter` blocks, generate multiple pages instead of one.

### Detection

```javascript
const chapters = manifest.blocks.filter(b => b.layout === "Chapter");
const hasChapters = chapters.length > 0;
```

### Processing

1. **Parse chapters** from blocks:
```javascript
const chapterData = chapters.map(c => ({
  name: c.props.name,
  slug: c.props.slug,
  href: c.props.slug === "/" ? "/" : c.props.slug
}));
```

2. **Split blocks by chapter**:
```javascript
// Group blocks between Chapter markers
const chapterBlocks = [];
let current = [];
for (const block of manifest.blocks) {
  if (block.layout === "Chapter") {
    if (current.length) chapterBlocks.push(current);
    current = [];
  } else {
    current.push(block);
  }
}
if (current.length) chapterBlocks.push(current);
```

3. **Generate data file** with chapters:
```typescript
export const chapters: Chapter[] = [
  { name: "Celestún", href: "/" },
  { name: "Uxmal", href: "uxmal" },
  { name: "Haciendas", href: "haciendas" },
];
```

4. **Generate one .astro file per chapter**:

| Chapter Slug | Generated File |
|--------------|----------------|
| `/` | `index.astro` |
| `uxmal` | `uxmal.astro` |
| `haciendas` | `haciendas.astro` |

Each page imports only the images used in that chapter.

### Chapter Page Template

Same as single-page, but only includes blocks for that chapter:

```astro
---
// ... imports ...
import { title, chapters } from "../../../data/{folder}";

// Only images for THIS chapter
import img001 from "...";
import img002 from "...";
---

<BaseLayout title={pageTitle} navTitle={title} chapters={chapters}>
  <!-- Only blocks for this chapter -->
</BaseLayout>
```

### First Image Per Chapter

Add `priority={true}` to the first FullBleed/WideImage in **each** chapter page.
