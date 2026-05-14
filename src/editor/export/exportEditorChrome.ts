import { EDITOR_CHROME_NODE_NAME } from "../canvas/editorChrome";

interface VisibleNode {
  visible(): boolean;
  visible(value: boolean): void;
}

interface StageWithFind {
  find(selector: string): readonly VisibleNode[];
  batchDraw(): void;
}

interface HiddenNodeState {
  readonly node: VisibleNode;
  readonly visible: boolean;
}

export function runWithoutEditorChrome<T>(
  stage: StageWithFind,
  action: () => T,
): T {
  const hiddenNodes = hideEditorChrome(stage);
  try {
    return action();
  } finally {
    restoreEditorChrome(stage, hiddenNodes);
  }
}

function hideEditorChrome(stage: StageWithFind): readonly HiddenNodeState[] {
  const nodes = stage.find(`.${EDITOR_CHROME_NODE_NAME}`);
  const hiddenNodes = nodes.map((node) => ({ node, visible: node.visible() }));
  for (const node of nodes) {
    node.visible(false);
  }
  stage.batchDraw();
  return hiddenNodes;
}

function restoreEditorChrome(
  stage: StageWithFind,
  hiddenNodes: readonly HiddenNodeState[],
): void {
  for (const item of hiddenNodes) {
    item.node.visible(item.visible);
  }
  stage.batchDraw();
}
