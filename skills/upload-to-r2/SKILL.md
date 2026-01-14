---
name: upload-to-r2
description: Upload files to Cloudflare R2 storage. Supports images and videos with optional optimization. Returns public URLs.
---

# Upload to R2

Generic skill to upload files to Cloudflare R2 storage.

## Prerequisites

- `wrangler` installed and authenticated (`npm install -g wrangler && wrangler login`)
- R2 bucket configured (`chu-videos` for videos, `chu-images` for images)

## Usage

`/upload-to-r2 {file-or-folder} {bucket-path} [--optimize]`

Examples:
- `/upload-to-r2 ./video.mp4 cabo-2025/` - Upload single video
- `/upload-to-r2 ./optimized/ cabo-2025/` - Upload folder contents
- `/upload-to-r2 ./videos/ cabo-2025/ --optimize` - Optimize then upload

## Buckets

| Bucket | Domain | Use Case |
|--------|--------|----------|
| `chu-videos` | `play.chu.fyi` | Video files (.mp4) |
| `chu-images` | `images.chu.fyi` | Image files (future) |

## Video Optimization

When `--optimize` flag is passed, runs optimization before upload:

```bash
./scripts/optimize-videos.sh {input} ./tmp-optimized
```

Optimization settings:
- H.265/HEVC codec (50% more efficient than H.264)
- CRF 28 quality level
- Max 1920px width (maintains aspect)
- Audio removed (for muted loop videos)
- Faststart for web streaming
- Safari/iOS compatible (hvc1 tag)

## Upload Commands

### Single File

```bash
wrangler r2 object put chu-videos/{bucket-path}/{filename} --file {local-file} --remote
```

### Multiple Files

```bash
for file in {folder}/*.mp4; do
  filename=$(basename "$file")
  wrangler r2 object put chu-videos/{bucket-path}/$filename --file "$file" --remote
done
```

## Output

Returns URLs for uploaded files:

```
Uploaded 3 files to chu-videos/cabo-2025/:
- https://play.chu.fyi/cabo-2025/drinks-at-cuzi.mp4
- https://play.chu.fyi/cabo-2025/water-balloon-fight.mp4
- https://play.chu.fyi/cabo-2025/shark-attack.mp4
```

## Using Videos in Gallery

```astro
import LazyVideo from "../../../components/LazyVideo.svelte";

<LazyVideo
  src="https://play.chu.fyi/{bucket-path}/video-name.mp4"
  ariaLabel="Description of video"
  client:visible
/>
```

## Composability

This skill is used by:
- `/gallery` - When gallery includes video content
- Can be used standalone for any R2 upload task
