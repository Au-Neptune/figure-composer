import { describe, expect, it, vi } from "vitest";
import type { SourceImageFileAdapter } from "../platform/appPlatform";
import type { ProjectAction } from "../editor/state/projectStore";
import { createImportFilesHandler } from "./sourceImageImport";

describe("createImportFilesHandler", () => {
  it("imports supported image files through the injected adapter", async () => {
    const file = new File(["image"], "source.png", { type: "image/png" });
    const actions: ProjectAction[] = [];
    const adapter = createSourceImageFileAdapter();
    let errorMessage: string | null = "previous error";
    const handler = createImportFilesHandler(
      (action) => actions.push(action),
      (message) => {
        errorMessage = message;
      },
      adapter,
    );

    await handler([file]);

    expect(errorMessage).toBeNull();
    expect(adapter.readImageFile).toHaveBeenCalledWith(file);
    expect(actions).toEqual([
      {
        type: "sourceImageImported",
        imported: {
          name: "source.png",
          assetUrl: "blob:test",
          width: 120,
          height: 80,
        },
      },
    ]);
  });

  it("reports unsupported image files without calling the adapter", async () => {
    const file = new File(["image"], "source.gif", { type: "image/gif" });
    const actions: ProjectAction[] = [];
    const adapter = createSourceImageFileAdapter();
    let errorMessage: string | null = null;
    const handler = createImportFilesHandler(
      (action) => actions.push(action),
      (message) => {
        errorMessage = message;
      },
      adapter,
    );

    await handler([file]);

    expect(actions).toEqual([]);
    expect(adapter.readImageFile).not.toHaveBeenCalled();
    expect(errorMessage).toBe(
      "Only PNG, JPG, or WEBP Source Images can be imported: source.gif",
    );
  });
});

function createSourceImageFileAdapter(): SourceImageFileAdapter {
  return {
    readImageFile: vi.fn(async (file: File) => ({
      name: file.name,
      assetUrl: "blob:test",
      width: 120,
      height: 80,
    })),
  };
}
