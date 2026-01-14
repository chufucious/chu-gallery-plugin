# chu-gallery

AI-assisted photo gallery creation with Smith/Colberg/Szarkowski-informed layout curation.

## Philosophy

This plugin applies principles from masters of photo sequencing:

- **Keith Smith** — Group/Series/Sequence taxonomy; the gallery as a unified experience
- **Jörg Colberg** — Ruthless editing; visual rhythm; pacing
- **John Szarkowski** — The Five Characteristics for image assessment
- **Nathan Lyons** — Juxtaposition transforms meaning

> "The individual pages have to give up their independence in order to form a union." — Keith Smith

See `docs/photo-layout-principles.md` for the complete philosophy guide.

## Installation

### From GitHub

```bash
# Add as a marketplace
/plugin marketplace add ericchu/chu-gallery-plugin

# Install the plugin
/plugin install chu-gallery
```

### Manual Installation

Clone to your plugins directory:

```bash
git clone https://github.com/ericchu/chu-gallery-plugin ~/.claude/plugins/chu-gallery
```

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `gallery` | `/gallery`, "create gallery" | Orchestrates the full workflow |
| `review-image-batch` | (sub-agent) | Reviews images and suggests layouts |
| `generate-astro-gallery` | `/generate-astro-gallery` | Generates Astro pages from manifest |
| `extract-exif` | `/extract-exif` | Extracts EXIF metadata to JSON |
| `upload-to-r2` | `/upload-to-r2` | Uploads videos to Cloudflare R2 |

## Usage

### Full Gallery Workflow

```
/gallery cabo-2025 "CABO 2025" cabo
```

This:
1. Extracts EXIF metadata from images
2. Spawns sub-agents to review images in parallel batches
3. Merges batch results into a manifest
4. Generates Astro page files

### Individual Skills

```bash
# Extract EXIF from any folder
/extract-exif ./photos output.json

# Regenerate pages from existing manifest
/generate-astro-gallery src/data/gallery-manifests/cabo-2025.json

# Upload videos to R2
/upload-to-r2 ./videos/ cabo-2025/ --optimize
```

## Layout Components

| Component | Images | Purpose |
|-----------|--------|---------|
| FullBleed | 1 | Hero shots, climactic moments (max 2-4/gallery) |
| WideImage | 1 | Strong standalone shots — **DEFAULT** |
| OffsetImage | 1 | Verticals, quiet moments |
| InsetImage | 1 | Maximum restraint, intimate moments |
| Spacer | 0 | Visual pause between sections |
| TwoUp | 2 | Pairs with visual connection (max 2-3/gallery) |
| ThreeUp | 3 | Sequences, triptychs (max 1-2/gallery) |
| SplitLayout | 2 | Asymmetric pairs (max 1-2/gallery) |
| FourUp | 4 | Detail collections (max 0-1/gallery) |
| Chapter | 0 | Start new page section |

## Key Principles

### Default to Single Images

80%+ of layouts should be single-image (WideImage, OffsetImage, FullBleed).

Multi-image layouts are **rare exceptions**, not defaults.

### Lyons's Juxtaposition Test

Only use TwoUp when pairing creates meaning beyond either image alone:
- Temporal connection (same moment)
- Spatial connection (same scene, different angle)
- Formal echo (lines, shapes, colors)
- Transformation (together they say something new)

### Visual Rhythm

Vary intensity like music:
```
LOUD → medium → quiet → LOUD → soft → pause → medium...
```

Never create monotonous sequences of same-weight layouts.

### Szarkowski's Vocabulary

Assess images using the Five Characteristics:
- **The Thing Itself** — What reality is captured?
- **The Detail** — What fragments carry weight?
- **The Frame** — What's included/excluded?
- **Time** — What moment?
- **Vantage Point** — How does position create meaning?

## Scripts

Helper scripts for the workflow (require `bun`):

| Script | Purpose |
|--------|---------|
| `init-gallery-manifest.ts` | Create manifest from EXIF |
| `merge-gallery-batches.ts` | Combine batch review files |
| `validate-gallery-manifest.ts` | Fix common errors |
| `generate-gallery-files.ts` | Generate Astro pages |
| `optimize-videos.sh` | Optimize videos for web |

## Project Structure

```
chu-gallery-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── gallery/
│   │   └── SKILL.md
│   ├── review-image-batch/
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── layout-guide.md
│   ├── generate-astro-gallery/
│   │   └── SKILL.md
│   ├── extract-exif/
│   │   └── SKILL.md
│   └── upload-to-r2/
│       └── SKILL.md
├── scripts/
│   ├── init-gallery-manifest.ts
│   ├── merge-gallery-batches.ts
│   ├── validate-gallery-manifest.ts
│   ├── generate-gallery-files.ts
│   └── optimize-videos.sh
├── docs/
│   └── photo-layout-principles.md
└── README.md
```

## License

MIT
