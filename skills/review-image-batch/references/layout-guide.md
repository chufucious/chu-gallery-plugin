# Gallery Layout Guide

Comprehensive reference for photo gallery visual design. A gallery is not a dump of images—it's a visual narrative with rhythm, pacing, and intentional whitespace.

## Core Principle: Single Images First

**Default to single-image layouts.** Each photo should stand on its own.

Multi-image layouts (TwoUp, ThreeUp, SplitLayout, FourUp) are **rare exceptions** - use only when images have an extraordinary reason to be paired. Most galleries should be 80%+ single-image layouts.

**Ask yourself:** "Would these images lose meaning if shown separately?" If no, show them separately.

---

## Core Principle: Visual Rhythm

A gallery should breathe like music has dynamics:

```
LOUD → medium → quiet → LOUD → soft → pause → medium...
```

**Never** create sequences like:

```
TwoUp → TwoUp → TwoUp → FullBleed → TwoUp → TwoUp...
```

This creates visual fatigue. Vary the rhythm.

---

## Component Reference

### High Visual Weight (Hero Moments)

#### FullBleed
- **Width**: 100vw edge-to-edge
- **Effect**: Overwhelming, immersive, confrontational
- **Use for**:
  - Gallery openers (first image)
  - Climactic moments
  - Images that demand full attention
  - Strong environmental/landscape shots
- **Frequency**: 2-4 per gallery maximum
- **After FullBleed**: Always follow with breathing room (Spacer, WideImage, or OffsetImage)

#### WideImage
- **Width**: ~83% (10/12 columns), centered with margins
- **Effect**: Prominent but respectful of the page
- **Use for**:
  - Strong standalone images
  - Establishing shots
  - Transitional moments between sections
  - Images with strong horizontal composition
- **Frequency**: Flexible, good rhythm-setter

### Multi-Image Layouts (USE SPARINGLY)

**These are exceptions, not defaults. Most images should stand alone.**

#### TwoUpLayout
- **Width**: 50/50 side-by-side
- **Effect**: Dialogue, comparison, duality
- **Frequency**: MAX 2-3 per gallery. If you're using more, reconsider.

**ONLY use when images have EXTRAORDINARY connection:**

| Connection Type | Example |
|-----------------|---------|
| Temporal | Same moment, different angles (truly simultaneous) |
| Diptych | Intentional artistic pairing that creates new meaning |
| Narrative | Before/after, cause/effect where separation destroys meaning |
| Subject | Same person in clear dialogue between frames |

**DEFAULT TO SEPARATE.** If you're unsure whether to pair, don't pair.

**ANTI-PATTERNS:**
- Grouping because images are "related" (most images in a gallery are related)
- Grouping to "save space" or "move faster"
- Grouping similar compositions (show the best one alone instead)

#### SplitLayout
- **Width**: 1/3 + 2/3 asymmetric
- **Effect**: Intentional hierarchy, one image as context for another
- **Frequency**: MAX 1-2 per gallery
- **Use for**:
  - Portrait + environment where one literally frames the other
  - Detail + context that MUST be seen together
- **Props**: `ratio="1/2"` (default) or `ratio="2/3"`

#### ThreeUpLayout
- **Width**: Three equal panels (scrollable on mobile)
- **Effect**: Rapid progression, triptych
- **Frequency**: MAX 1-2 per gallery
- **Use ONLY for**:
  - True sequences (entering → inside → emerging)
  - Triptychs with clear visual throughline
- **Never** use just because you have 3 related images

#### FourUpGrid
- **Width**: 2x2 grid
- **Effect**: Collection, texture study
- **Frequency**: MAX 0-1 per gallery. Often unnecessary.
- **Use for**:
  - Detail collections where individual images don't merit attention
  - Texture/pattern studies
- **Usually a sign of weak curation** - consider cutting images instead

### Whitespace Components (NEW)

#### OffsetImage
- **Width**: 4-5 columns (~35-42%), can align left/center/right
- **Effect**: Restraint, breathing room, intimate moment
- **Use for**:
  - **Vertical/portrait images that shouldn't dominate**
  - Quiet, contemplative moments
  - Punctuation between sections
  - Images that need negative space to work
- **Props**: `align="left|center|right"`, `size="small|medium"`, `priority`
- **Default**: `align="left"` `size="medium"` `priority=false`

**IMPORTANT**: Vertical images should default to OffsetImage, NOT be forced into TwoUp/SplitLayout pairs.

#### InsetImage
- **Width**: 4 columns (~33%), always centered
- **Effect**: Maximum restraint, precious/intimate
- **Use for**:
  - Small quiet moments
  - Details that shouldn't compete
  - Intimate portraits
  - Visual whispers
- **Props**: `priority` (for above-the-fold, rarely needed)
- **Frequency**: 1-2 per gallery, special moments only

#### Spacer
- **Effect**: Pure vertical whitespace
- **Use for**:
  - Section/chapter breaks
  - After powerful images that need breathing room
  - Pacing control
- **Props**: `size="small|medium|large|xl"`
  - small: +3rem (8rem total gap)
  - medium: +6rem (11rem total gap) - default
  - large: +10rem (15rem total gap)
  - xl: +16rem (21rem total) - dramatic section breaks

---

## Visual Rhythm Patterns

### Good Rhythm Examples

```
FullBleed (opener)
  ↓
Spacer(small)
  ↓
TwoUp (related pair)
  ↓
OffsetImage(left) (vertical portrait)
  ↓
WideImage
  ↓
ThreeUp (sequence)
  ↓
Spacer(medium)
  ↓
FullBleed (climactic)
  ↓
OffsetImage(right)
  ↓
WideImage (closer)
```

### Bad Rhythm (Avoid)

```
FullBleed
TwoUp
TwoUp
TwoUp      ← monotonous
FullBleed
TwoUp
TwoUp      ← no breathing room
```

---

## Decision Flowchart

For each image:

1. **Is it a hero shot?** → FullBleed (max 2-4 per gallery)
2. **Is it vertical/portrait?** → OffsetImage (default) or InsetImage (if intimate)
3. **Is it a strong standalone?** → WideImage ← **THIS IS THE DEFAULT**
4. **Is it a quieter moment?** → OffsetImage with appropriate alignment
5. **Need breathing room?** → Spacer before next block

**Only after exhausting single-image options:**

6. **Is there an EXTRAORDINARY reason to pair?** (see criteria above)
   - Truly simultaneous moment? → TwoUp (max 2-3 per gallery)
   - One frames the other? → SplitLayout (max 1-2 per gallery)
7. **Is it a true triptych/sequence?** → ThreeUp (max 1-2 per gallery)
8. **Are these throwaway details?** → FourUpGrid (max 0-1) or just cut them

---

## Orientation Handling

| Orientation | Default Component | Alternative |
|-------------|-------------------|-------------|
| Landscape (wide) | WideImage, FullBleed | TwoUp if paired |
| Portrait (tall) | OffsetImage | InsetImage, SplitLayout |
| Square | WideImage | TwoUp, ThreeUp |

**Never** force vertical images into full-width layouts—they overwhelm the viewport.

---

## Quality Checklist

Before finalizing blocks, verify:

- [ ] **80%+ single-image layouts** (WideImage, OffsetImage, FullBleed, InsetImage)
- [ ] **MAX 2-3 TwoUp** in entire gallery
- [ ] **MAX 1-2 ThreeUp** in entire gallery
- [ ] **MAX 1-2 SplitLayout** in entire gallery
- [ ] **MAX 0-1 FourUp** in entire gallery
- [ ] No consecutive multi-image layouts
- [ ] Vertical images use OffsetImage (not forced into pairs)
- [ ] FullBleed images have breathing room after
- [ ] Multi-image groups have EXTRAORDINARY reason to be paired
- [ ] At least 1-2 Spacers for pacing
- [ ] First image is FullBleed or WideImage with `priority={true}`
- [ ] Chapters added for galleries with clear thematic/location breaks

---

## Chapters

Chapters divide a gallery into distinct sections, each becoming a separate page with navigation.

### When to Use Chapters

| Scenario | Use Chapters? |
|----------|---------------|
| 30+ images with clear location/theme breaks | **Yes** |
| Trip with distinct days or destinations | **Yes** |
| Single event or continuous narrative | No |
| < 25 images | Usually no |

**Signs you need a chapter break:**
- Location change (beach → ruins → city)
- Time jump (morning → evening, day 1 → day 2)
- Subject shift (people → architecture → landscape)
- Natural narrative arc completion

### Chapter Block Format

```json
{
  "layout": "Chapter",
  "images": [],
  "props": {
    "name": "Celestún",
    "slug": "/"
  },
  "notes": "Boat tour and beach - opening chapter"
}
```

**Props (required):**
- `name`: Display name for navigation (e.g., "Celestún", "Day Two")
- `slug`: URL segment (`/` for first chapter, `uxmal` → `/photographing/gallery/uxmal`)

### Chapter Placement Rules

1. **First block should be Chapter** (if using chapters at all)
2. **Chapter starts a new page** - all blocks after it until next Chapter go on that page
3. **Each chapter needs a hero** - FullBleed or WideImage with `priority` after Chapter block
4. **Minimum 10-15 images per chapter** - don't over-fragment

### Example: Multi-Chapter Gallery

```
Chapter(name: "Celestún", slug: "/")
  FullBleed (opener for chapter 1) ← priority={true}
  Spacer(small)
  TwoUp
  OffsetImage
  WideImage
  ...

Chapter(name: "Uxmal", slug: "uxmal")
  FullBleed (opener for chapter 2) ← priority={true}
  Spacer(small)
  ThreeUp
  WideImage
  ...

Chapter(name: "Haciendas", slug: "haciendas")
  WideImage (opener for chapter 3) ← priority={true}
  ...
```

### Generated Output

From the above manifest, generation creates:

**Data file** (`src/data/{folder}.ts`):
```typescript
export const chapters: Chapter[] = [
  { name: "Celestún", href: "/" },
  { name: "Uxmal", href: "uxmal" },
  { name: "Haciendas", href: "haciendas" },
];
```

**Page files:**
- `src/pages/photographing/{slug}/index.astro` (Celestún)
- `src/pages/photographing/{slug}/uxmal.astro`
- `src/pages/photographing/{slug}/haciendas.astro`

### Identifying Chapter Breaks During Review

When reviewing batches, look for:

1. **Timestamp gaps** - EXIF shows hours/days between images
2. **Location shifts** - Different backgrounds, lighting, subjects
3. **Narrative closure** - A sequence feels "complete"

If you notice a clear break mid-batch, insert a Chapter block:

```
Batch 5 complete. Reviewed images 33-40. Added 6 blocks:
- WideImage: final beach sunset
- Spacer(large): end of beach section
- Chapter: "Uxmal" (slug: "uxmal") - shifting to ruins
- FullBleed: pyramid establishing shot
- TwoUp: architectural details
- OffsetImage: tourist portrait

Note: Clear location change at image 36 - beach → ruins.
```
