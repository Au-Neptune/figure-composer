import { describe, expect, it } from "vitest";
import { EDITOR_CHROME_NODE_NAME } from "../canvas/editorChrome";
import { runWithoutEditorChrome } from "./exportEditorChrome";

interface TestVisibleNode {
  visible(): boolean;
  visible(value: boolean): void;
}

describe("runWithoutEditorChrome", () => {
  it("hides editor chrome while rendering and restores it afterward", () => {
    const node = createVisibleNode(true);
    const stage = createStage([node]);

    const visibleDuringRender = runWithoutEditorChrome(stage, () => node.visible());

    expect(visibleDuringRender).toBe(false);
    expect(node.visible()).toBe(true);
    expect(stage.selector).toBe(`.${EDITOR_CHROME_NODE_NAME}`);
    expect(stage.drawCount).toBe(2);
  });

  it("restores editor chrome when rendering throws", () => {
    const node = createVisibleNode(true);
    const stage = createStage([node]);

    expect(() =>
      runWithoutEditorChrome(stage, () => {
        throw new Error("render failed");
      }),
    ).toThrow("render failed");
    expect(node.visible()).toBe(true);
  });
});

function createVisibleNode(initialVisible: boolean): TestVisibleNode {
  let currentVisible = initialVisible;
  function visible(): boolean;
  function visible(value: boolean): void;
  function visible(value?: boolean): boolean | void {
    if (value === undefined) {
      return currentVisible;
    }
    currentVisible = value;
  }
  return {
    visible,
  };
}

function createStage(nodes: readonly TestVisibleNode[]) {
  return {
    selector: "",
    drawCount: 0,
    find(selector: string) {
      this.selector = selector;
      return nodes;
    },
    batchDraw() {
      this.drawCount += 1;
    },
  };
}
