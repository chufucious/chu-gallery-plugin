#!/bin/bash
# optimize-videos.sh
# Optimizes videos for web delivery using ffmpeg
# Usage: ./scripts/optimize-videos.sh /path/to/input/folder [/path/to/output/folder]

set -e

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./optimized}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Video Optimization Script${NC}"
echo "Input directory: $INPUT_DIR"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg is not installed${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Count videos
shopt -s nullglob nocaseglob
video_files=("$INPUT_DIR"/*.mp4 "$INPUT_DIR"/*.mov "$INPUT_DIR"/*.m4v)
video_count=${#video_files[@]}

if [ $video_count -eq 0 ]; then
    echo -e "${RED}No video files found in $INPUT_DIR${NC}"
    echo "Supported formats: .mp4, .mov, .m4v"
    exit 1
fi

echo -e "Found ${GREEN}$video_count${NC} video(s) to process"
echo ""

# Process each video
processed=0
for video in "${video_files[@]}"; do

    filename=$(basename "$video")
    name="${filename%.*}"
    output="$OUTPUT_DIR/${name}_optimized.mp4"

    ((processed++))
    echo -e "${YELLOW}[$processed/$video_count]${NC} Processing: $filename"

    # Get original size
    original_size=$(stat -f%z "$video" 2>/dev/null || stat --format=%s "$video" 2>/dev/null)
    original_mb=$(echo "scale=2; $original_size / 1048576" | bc)

    # Optimize video
    # - H.265/HEVC codec (50% more efficient than H.264)
    # - CRF 28 (H.265 default, equivalent to H.264 CRF 23)
    # - medium preset (good balance of speed/compression)
    # - hvc1 tag for Safari/iOS compatibility
    # - faststart for web streaming
    # - scale to max 1080p width, maintain aspect ratio
    # - remove audio (for muted loop videos)
    ffmpeg -i "$video" \
        -c:v libx265 \
        -crf 28 \
        -preset medium \
        -pix_fmt yuv420p \
        -tag:v hvc1 \
        -movflags +faststart \
        -vf "scale='min(1920,iw)':-2" \
        -an \
        -y \
        "$output" \
        2>/dev/null

    # Get new size
    new_size=$(stat -f%z "$output" 2>/dev/null || stat --format=%s "$output" 2>/dev/null)
    new_mb=$(echo "scale=2; $new_size / 1048576" | bc)

    # Calculate savings
    savings=$(echo "scale=0; (1 - $new_size / $original_size) * 100" | bc)

    echo -e "  ${GREEN}Done:${NC} ${original_mb}MB → ${new_mb}MB (${savings}% smaller)"
done

echo ""
echo -e "${GREEN}Optimization complete!${NC}"
echo "Optimized videos saved to: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "1. Review the optimized videos to ensure quality is acceptable"
echo "2. Upload to Cloudflare R2: wrangler r2 object put chu-videos/path/video.mp4 --file ./optimized/video.mp4"
