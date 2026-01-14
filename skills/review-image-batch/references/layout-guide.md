# Gallery Layout Guide

Comprehensive reference for photo gallery visual design. A gallery is not a dump of images—it's a visual narrative with rhythm, pacing, and intentional whitespace.

## Core Principle: Visual Judgment

A gallery needs **rhythm and variety** — not a mechanical formula.

Single-image layouts (WideImage, OffsetImage, FullBleed, InsetImage) let strong images breathe.

Multi-image layouts (TwoUp, ThreeUp, SplitLayout) create dialogue and meaning through juxtaposition.

**The question isn't "should I pair?" but "does this pairing create meaning beyond either image alone?"**

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
- **After FullBleed**: Follow with breathing room (Spacer, WideImage, or OffsetImage)

#### WideImage
- **Width**: ~83% (10/12 columns), centered with margins
- **Effect**: Prominent but respectful of the page
- **Use for**:
  - Strong standalone images
  - Establishing shots
  - Transitional moments between sections
  - Images with strong horizontal composition
- **Frequency**: Flexible, good rhythm-setter

### Multi-Image Layouts (Dialogue & Sequence)

Multi-image layouts create visual dialogue. A good pairing says something neither image says alone.

#### TwoUpLayout
- **Width**: 50/50 side-by-side
- **Effect**: Dialogue, comparison, duality

**Lyons's Juxtaposition Test** — pair when:

| Connection Type | Example |
|-----------------|---------|
| Temporal | Same moment, different angles |
| Spatial | Same scene, complementary views |
| Formal echo | Compositional rhyme (lines, shapes, colors) |
| Emotional | Contrast or reinforcement of feeling |
| Transformation | Together they say something neither says alone |

A strong TwoUp is better than two mediocre WideImages.

#### SplitLayout
- **Width**: 1/3 + 2/3 asymmetric
- **Effect**: Intentional hierarchy, one image as context for another
- **Use for**:
  - Portrait + environment where one frames the other
  - Detail + context that work together
- **Props**: `ratio="1/2"` (default) or `ratio="2/3"`

#### ThreeUpLayout
- **Width**: Three equal panels (scrollable on mobile)
- **Effect**: Rapid progression, triptych
- **Use for**:
  - True sequences (entering → through → emerging)
  - Triptychs with clear visual throughline
  - Movement or progression through space/time

#### FourUpGrid
- **Width**: 2x2 grid
- **Effect**: Collection, texture study
- **Use for**:
  - Detail collections (textures, patterns, fragments)
  - Four moments that form a complete thought

### Whitespace Components

#### OffsetImage
- **Width**: 4-5 columns (~35-42%), can align left/center/right
- **Effect**: Restraint, breathing room, intimate moment
- **Use for**:
  - Vertical/portrait images
  - Quiet, contemplative moments
  - Punctuation between sections
  - Images that need negative space to work
- **Props**: `align="left|center|right"`, `size="small|medium"`, `priority`
- **Default**: `align="left"` `size="medium"` `priority=false`

Vertical images naturally suit OffsetImage—they get breathing room without dominating.

#### InsetImage
- **Width**: 4 columns (~33%), always centered
- **Effect**: Maximum restraint, precious/intimate
- **Use for**:
  - Small quiet moments
  - Details that shouldn't compete
  - Intimate portraits
  - Visual whispers
- **Props**: `priority` (for above-the-fold)

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

## Decision Guide

For each image, consider its role in the visual narrative:

**Single-image layouts:**
- **FullBleed** — Hero moments that demand full attention
- **WideImage** — Strong standalone images
- **OffsetImage** — Verticals, quiet moments, breathing room
- **InsetImage** — Intimate details, visual whispers

**Multi-image layouts:**
- **TwoUp** — When juxtaposition creates dialogue (apply Lyons's test)
- **ThreeUp** — True sequences with visual throughline
- **SplitLayout** — Asymmetric pairs where one frames the other
- **FourUp** — Collections that form a complete thought

**Pacing:**
- **Spacer** — Breathing room after powerful images
- **Chapter** — Location/theme/time breaks

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

Before finalizing blocks, verify rhythm and variety:

- [ ] Gallery has visual dynamics (loud, medium, quiet moments)
- [ ] No monotonous sequences (same layout repeated 3+ times)
- [ ] Multi-image pairings create meaning (pass Lyons's test)
- [ ] Verticals have appropriate breathing room
- [ ] FullBleed images followed by lighter layouts
- [ ] Spacers used for pacing and section breaks
- [ ] First image has `priority={true}` for LCP
- [ ] Chapters mark clear location/theme breaks

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
