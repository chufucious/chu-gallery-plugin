---
name: extract-exif
description: Extract EXIF metadata from images to JSON. Works with any image folder. Outputs structured data including dimensions, orientation, and timestamps.
---

# Extract EXIF Metadata

Generic skill to extract EXIF metadata from images using `exiftool`.

## Prerequisites

- `exiftool` installed (`brew install exiftool`)

## Usage

Invoke with: `/extract-exif {path} [output.json]`

Examples:
- `/extract-exif ./photos` - Print JSON to stdout
- `/extract-exif ~/Pictures/vacation ./metadata.json` - Write to file

## Implementation

```bash
exiftool -ImageWidth -ImageHeight -DateTimeOriginal -Make -Model -LensModel -FocalLength -FNumber -ExposureTime -ISO -json {PATH}/*.{jpeg,jpg,JPEG,JPG,png,PNG,heic,HEIC} 2>/dev/null | \
  bun -e '
const data = await Bun.stdin.json();
const images = data.map(img => ({
  filename: img.SourceFile.split("/").pop(),
  path: img.SourceFile,
  width: img.ImageWidth,
  height: img.ImageHeight,
  aspect: img.ImageWidth && img.ImageHeight ? +(img.ImageWidth / img.ImageHeight).toFixed(2) : null,
  orientation: img.ImageWidth > img.ImageHeight ? "landscape" : img.ImageWidth < img.ImageHeight ? "portrait" : "square",
  timestamp: img.DateTimeOriginal || null,
  camera: img.Make && img.Model ? `${img.Make} ${img.Model}`.trim() : null,
  lens: img.LensModel || null,
  focalLength: img.FocalLength || null,
  aperture: img.FNumber || null,
  shutter: img.ExposureTime || null,
  iso: img.ISO || null
}));
console.log(JSON.stringify({ count: images.length, images }, null, 2));
'
```

## Output Schema

```json
{
  "count": 42,
  "images": [
    {
      "filename": "DSCF1234.jpeg",
      "path": "/path/to/DSCF1234.jpeg",
      "width": 3840,
      "height": 2560,
      "aspect": 1.5,
      "orientation": "landscape",
      "timestamp": "2025:01:05 10:35:11",
      "camera": "FUJIFILM X-T5",
      "lens": "XF23mmF1.4 R LM WR",
      "focalLength": "23.0 mm",
      "aperture": 1.4,
      "shutter": "1/500",
      "iso": 160
    }
  ]
}
```

## Composability

This skill is used by:
- `/gallery` - Extracts metadata for gallery manifest creation
- Can be used standalone for any image metadata extraction task
