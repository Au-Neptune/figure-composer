import { useEffect, useRef } from "react";
import type Konva from "konva";

export function useKonvaTransformer<TNode extends Konva.Node>(
  selected: boolean,
) {
  const nodeRef = useRef<TNode>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    const node = nodeRef.current;
    if (!selected || !transformer || !node) {
      return;
    }
    transformer.nodes([node]);
    transformer.getLayer()?.batchDraw();
  }, [selected]);

  return { nodeRef, transformerRef };
}

