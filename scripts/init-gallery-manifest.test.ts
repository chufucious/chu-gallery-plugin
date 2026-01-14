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

// For versioned galleries, allow specifying a gallery name different from folder
function resolveGalleryPaths(
  input: string,
  galleryName?: string
): { folder: string; imageDir: string; manifestName: string } {
  const cleaned = input.replace(/\/$/, "");

  if (cleaned.includes("/")) {
    const folder = cleaned.split("/").pop()!;
    return {
      folder,
      imageDir: cleaned,
      manifestName: galleryName || folder,
    };
  }

  return {
    folder: cleaned,
    imageDir: `src/assets/images/photos/${cleaned}`,
    manifestName: galleryName || cleaned,
  };
}

describe("resolveGalleryPaths with versioning", () => {
  test("uses folder name as manifest name by default", () => {
    const result = resolveGalleryPaths("merida-2026");
    expect(result.manifestName).toBe("merida-2026");
  });

  test("allows overriding manifest name for versioned galleries", () => {
    const result = resolveGalleryPaths("src/assets/images/photos/merida-2026", "merida-2026-v4");
    expect(result.folder).toBe("merida-2026");
    expect(result.imageDir).toBe("src/assets/images/photos/merida-2026");
    expect(result.manifestName).toBe("merida-2026-v4");
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
