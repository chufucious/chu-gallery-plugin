import { describe, test, expect } from "bun:test";

interface Block {
  layout: string;
  images: string[];
  props: Record<string, unknown>;
  notes: string;
}

// Function to detect duplicate images in consecutive blocks
function findDuplicateImages(blocks: Block[]): { blockIndex: number; image: string }[] {
  const duplicates: { blockIndex: number; image: string }[] = [];
  const seenImages = new Set<string>();

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    for (const image of block.images) {
      if (seenImages.has(image)) {
        duplicates.push({ blockIndex: i, image });
      } else {
        seenImages.add(image);
      }
    }
  }

  return duplicates;
}

describe("findDuplicateImages", () => {
  test("returns empty array when no duplicates", () => {
    const blocks: Block[] = [
      { layout: "WideImage", images: ["DSCF001.jpeg"], props: {}, notes: "" },
      { layout: "WideImage", images: ["DSCF002.jpeg"], props: {}, notes: "" },
      { layout: "TwoUp", images: ["DSCF003.jpeg", "DSCF004.jpeg"], props: {}, notes: "" },
    ];
    expect(findDuplicateImages(blocks)).toEqual([]);
  });

  test("detects duplicate image in later block", () => {
    const blocks: Block[] = [
      { layout: "WideImage", images: ["DSCF001.jpeg"], props: {}, notes: "" },
      { layout: "WideImage", images: ["DSCF001.jpeg"], props: {}, notes: "" }, // duplicate
    ];
    expect(findDuplicateImages(blocks)).toEqual([
      { blockIndex: 1, image: "DSCF001.jpeg" }
    ]);
  });

  test("detects multiple duplicates", () => {
    const blocks: Block[] = [
      { layout: "WideImage", images: ["DSCF001.jpeg"], props: {}, notes: "" },
      { layout: "WideImage", images: ["DSCF002.jpeg"], props: {}, notes: "" },
      { layout: "WideImage", images: ["DSCF001.jpeg"], props: {}, notes: "" }, // dup
      { layout: "WideImage", images: ["DSCF002.jpeg"], props: {}, notes: "" }, // dup
    ];
    const dupes = findDuplicateImages(blocks);
    expect(dupes).toHaveLength(2);
    expect(dupes).toContainEqual({ blockIndex: 2, image: "DSCF001.jpeg" });
    expect(dupes).toContainEqual({ blockIndex: 3, image: "DSCF002.jpeg" });
  });

  test("ignores Spacer and Chapter blocks (no images)", () => {
    const blocks: Block[] = [
      { layout: "WideImage", images: ["DSCF001.jpeg"], props: {}, notes: "" },
      { layout: "Spacer", images: [], props: {}, notes: "" },
      { layout: "Chapter", images: [], props: {}, notes: "" },
      { layout: "WideImage", images: ["DSCF002.jpeg"], props: {}, notes: "" },
    ];
    expect(findDuplicateImages(blocks)).toEqual([]);
  });

  test("detects duplicate within TwoUp block", () => {
    const blocks: Block[] = [
      { layout: "TwoUp", images: ["DSCF001.jpeg", "DSCF001.jpeg"], props: {}, notes: "" },
    ];
    expect(findDuplicateImages(blocks)).toEqual([
      { blockIndex: 0, image: "DSCF001.jpeg" }
    ]);
  });
});
