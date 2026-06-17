const { v4: uuidv4 } = require('uuid');

function splitNode(root, targetTerminalId, droppedTerminalId, zone) {
  if (root.type === "leaf") {
    if (root.terminalId === targetTerminalId) {
      const isHorizontal = zone === "left" || zone === "right";
      const newLeaf = {
        id: uuidv4(),
        type: "leaf",
        terminalId: droppedTerminalId,
      };

      let first, second;
      if (zone === "left" || zone === "top") {
        first = newLeaf;
        second = root;
      } else {
        first = root;
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

let layout = { id: "1", type: "leaf", terminalId: "term-1" };
let terminalStates = { "term-1": { isActive: true } };

let activeId = "term-1";
let newId = "term-2";
layout = splitNode(layout, activeId, newId, "right");
console.log(JSON.stringify(layout, null, 2));

// Rapid second press: activeId is still "term-1"
newId = "term-3";
layout = splitNode(layout, activeId, newId, "right");
console.log(JSON.stringify(layout, null, 2));

