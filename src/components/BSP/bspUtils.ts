import { v4 as uuidv4 } from "uuid";

export type SplitDirection = "horizontal" | "vertical";
export type DropZone = "top" | "bottom" | "left" | "right";

export type LayoutLeaf = {
  id: string;
  type: "leaf";
  terminalId: string;
};

export type LayoutSplit = {
  id: string;
  type: "split";
  direction: SplitDirection;
  ratio: number; // Percentage of the first child (0-100)
  first: LayoutNode;
  second: LayoutNode;
};

export type LayoutNode = LayoutLeaf | LayoutSplit;

/**
 * Removes a terminal leaf from the tree and normalizes the tree
 * (collapses splits with only one child).
 */
export function removeNode(root: LayoutNode, idToRemove: string): LayoutNode | null {
  if (root.type === "leaf") {
    return root.terminalId === idToRemove ? null : root;
  }

  if (root.type === "split") {
    const newFirst = removeNode(root.first, idToRemove);
    const newSecond = removeNode(root.second, idToRemove);

    if (!newFirst && !newSecond) return null;
    if (!newFirst) return newSecond; // Merge up second
    if (!newSecond) return newFirst; // Merge up first

    return { ...root, first: newFirst, second: newSecond };
  }

  return root;
}

/**
 * Splits a target leaf into two leaves based on drop zone.
 */
export function splitNode(
  root: LayoutNode,
  targetTerminalId: string,
  droppedTerminalId: string,
  zone: DropZone
): LayoutNode {
  if (root.type === "leaf") {
    if (root.terminalId === targetTerminalId) {
      const isHorizontal = zone === "left" || zone === "right";
      const newLeaf: LayoutLeaf = {
        id: uuidv4(),
        type: "leaf",
        terminalId: droppedTerminalId,
      };

      let first: LayoutNode, second: LayoutNode;
      if (zone === "left" || zone === "top") {
        first = newLeaf;
        second = root; // Original stays second
      } else {
        first = root;  // Original stays first
        second = newLeaf;
      }

      return {
        id: uuidv4(),
        type: "split",
        direction: isHorizontal ? "horizontal" : "vertical",
        ratio: 50,
        first,
        second,
      };
    }
    return root;
  }

  if (root.type === "split") {
    return {
      ...root,
      first: splitNode(root.first, targetTerminalId, droppedTerminalId, zone),
      second: splitNode(root.second, targetTerminalId, droppedTerminalId, zone),
    };
  }

  return root;
}

/**
 * Updates the ratio of a specific split.
 */
export function updateSplitRatio(
  root: LayoutNode,
  splitId: string,
  newRatio: number
): LayoutNode {
  if (root.type === "split") {
    if (root.id === splitId) {
      return { ...root, ratio: newRatio };
    }
    return {
      ...root,
      first: updateSplitRatio(root.first, splitId, newRatio),
      second: updateSplitRatio(root.second, splitId, newRatio),
    };
  }
  return root;
}

export function getParentSplits(root: LayoutNode, terminalId: string) {
  let hSplitId: string | undefined;
  let vSplitId: string | undefined;

  function walk(node: LayoutNode, currentH?: string, currentV?: string): boolean {
    if (node.type === "leaf") {
      if (node.terminalId === terminalId) {
        hSplitId = currentH;
        vSplitId = currentV;
        return true;
      }
      return false;
    }
    const nextH = node.direction === "horizontal" ? node.id : currentH;
    const nextV = node.direction === "vertical" ? node.id : currentV;
    return walk(node.first, nextH, nextV) || walk(node.second, nextH, nextV);
  }

  walk(root);
  return { hSplitId, vSplitId };
}

export function getSplitRatio(root: LayoutNode, splitId: string): number | null {
  if (root.type === "split") {
    if (root.id === splitId) return root.ratio;
    return getSplitRatio(root.first, splitId) ?? getSplitRatio(root.second, splitId);
  }
  return null;
}
