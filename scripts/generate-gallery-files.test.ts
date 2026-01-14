import { describe, test, expect } from "bun:test";

interface Manifest {
  gallery: string;
  title: string;
  slug: string;
  year: string;
  sourceFolder?: string; // NEW: tracks where images actually live
  images: { filename: string }[];
  blocks: any[];
}

interface ChapterData {
  name: string;
  slug: string;
  href: string;
  blocks: any[];
}

// Function to get prev/next hrefs for a chapter
function getChapterNavigation(chapters: ChapterData[], index: number): { prevHref?: string; nextHref?: string } {
  const prev = index > 0 ? chapters[index - 1] : null;
  const next = index < chapters.length - 1 ? chapters[index + 1] : null;

  return {
    prevHref: prev ? (prev.slug === "/" ? "/" : prev.slug) : undefined,
    nextHref: next ? (next.slug === "/" ? "/" : next.slug) : undefined,
  };
}

describe("getChapterNavigation", () => {
  const chapters: ChapterData[] = [
    { name: "Part I", slug: "/", href: "/", blocks: [] },
    { name: "Uxmal", slug: "uxmal", href: "uxmal", blocks: [] },
    { name: "Haciendas", slug: "haciendas", href: "haciendas", blocks: [] },
  ];

  test("first chapter has no prev, has next", () => {
    const nav = getChapterNavigation(chapters, 0);
    expect(nav.prevHref).toBeUndefined();
    expect(nav.nextHref).toBe("uxmal");
  });

  test("middle chapter has both prev and next", () => {
    const nav = getChapterNavigation(chapters, 1);
    expect(nav.prevHref).toBe("/");
    expect(nav.nextHref).toBe("haciendas");
  });

  test("last chapter has prev, no next", () => {
    const nav = getChapterNavigation(chapters, 2);
    expect(nav.prevHref).toBe("uxmal");
    expect(nav.nextHref).toBeUndefined();
  });

  test("single chapter has no navigation", () => {
    const singleChapter: ChapterData[] = [
      { name: "All", slug: "/", href: "/", blocks: [] },
    ];
    const nav = getChapterNavigation(singleChapter, 0);
    expect(nav.prevHref).toBeUndefined();
    expect(nav.nextHref).toBeUndefined();
  });
});

// Function to determine the image folder path
function getImageFolder(manifest: Manifest): string {
  // Use sourceFolder if available, otherwise fall back to gallery name
  return manifest.sourceFolder || manifest.gallery;
}

describe("getImageFolder", () => {
  test("uses sourceFolder when available", () => {
    const manifest: Manifest = {
      gallery: "merida-2026-v4",
      title: "MÉRIDA 2026",
      slug: "merida-v4",
      year: "2026",
      sourceFolder: "merida-2026", // Images are here
      images: [],
      blocks: [],
    };
    expect(getImageFolder(manifest)).toBe("merida-2026");
  });

  test("falls back to gallery name when sourceFolder not set", () => {
    const manifest: Manifest = {
      gallery: "cabo-2025",
      title: "CABO 2025",
      slug: "cabo",
      year: "2025",
      images: [],
      blocks: [],
    };
    expect(getImageFolder(manifest)).toBe("cabo-2025");
  });
});
