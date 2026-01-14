import { describe, test, expect } from "bun:test";

// Extract the path resolution logic we need to fix
function resolveGalleryFolder(input: string): { folder: string; imageDir: string } {
  // Remove trailing slash
  const cleaned = input.replace(/\/$/, "");

  // Check if it's already a path (contains /)
  if (cleaned.includes("/")) {
    // Extract folder name from path
    const folder = cleaned.split("/").pop()!;
    return { folder, imageDir: cleaned };
  }

  // Simple folder name - prepend default path
  return { folder: cleaned, imageDir: `src/assets/images/photos/${cleaned}` };
}

// For versioned galleries, slug is used as manifest name by default
function resolveGalleryPaths(
  input: string,
  slug: string,
  galleryName?: string
): { folder: string; imageDir: string; manifestName: string } {
  const cleaned = input.replace(/\/$/, "");

  if (cleaned.includes("/")) {
    const folder = cleaned.split("/").pop()!;
    return {
      folder,
      imageDir: cleaned,
      manifestName: galleryName || slug,
    };
  }

  return {
    folder: cleaned,
    imageDir: `src/assets/images/photos/${cleaned}`,
    manifestName: galleryName || slug,
  };
}

describe("resolveGalleryPaths with versioning", () => {
  test("uses slug as manifest name by default", () => {
    const result = resolveGalleryPaths("merida-2026", "merida-v5");
    expect(result.manifestName).toBe("merida-v5");
  });

  test("uses slug even when folder path differs", () => {
    const result = resolveGalleryPaths("src/assets/images/photos/merida-2026", "merida-v5");
    expect(result.folder).toBe("merida-2026");
    expect(result.imageDir).toBe("src/assets/images/photos/merida-2026");
    expect(result.manifestName).toBe("merida-v5");
  });

  test("allows explicit galleryName override", () => {
    const result = resolveGalleryPaths("src/assets/images/photos/merida-2026", "merida-v5", "custom-name");
    expect(result.manifestName).toBe("custom-name");
  });
});

describe("resolveGalleryFolder", () => {
  test("handles simple folder name", () => {
    const result = resolveGalleryFolder("merida-2026");
    expect(result.folder).toBe("merida-2026");
    expect(result.imageDir).toBe("src/assets/images/photos/merida-2026");
  });

  test("handles relative path - extracts folder name", () => {
    const result = resolveGalleryFolder("src/assets/images/photos/merida-2026");
    expect(result.folder).toBe("merida-2026");
    expect(result.imageDir).toBe("src/assets/images/photos/merida-2026");
  });

  test("handles absolute path - extracts folder name", () => {
    const result = resolveGalleryFolder("/Users/eric/projects/chu.fyi-astro/src/assets/images/photos/merida-2026");
    expect(result.folder).toBe("merida-2026");
    expect(result.imageDir).toBe("/Users/eric/projects/chu.fyi-astro/src/assets/images/photos/merida-2026");
  });

  test("handles path with trailing slash", () => {
    const result = resolveGalleryFolder("src/assets/images/photos/merida-2026/");
    expect(result.folder).toBe("merida-2026");
    expect(result.imageDir).toBe("src/assets/images/photos/merida-2026");
  });
});
