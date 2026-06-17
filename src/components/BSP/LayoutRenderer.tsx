import React from "react";
import Terminal from "@/components/Terminal/Terminal";
import { LayoutNode, DropZone } from "./bspUtils";
import type { TerminalState } from "@/hooks/useWindowManager";

let draggedTerminalIdLocal: string | null = null;

interface LayoutRendererProps {
  node: LayoutNode;
  terminalStates: Record<string, TerminalState>;
  updateTerminalState: (id: string, updates: Partial<TerminalState>) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (targetId: string, zone: DropZone) => void;
  onDragEnd: () => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  draggedTerminalId: string | null;
}

export const setDraggedTerminalIdLocal = (id: string | null) => {
  draggedTerminalIdLocal = id;
};

const LayoutRenderer = ({ 
  node, 
  terminalStates,
  updateTerminalState,
  onDragStart, 
  onDrop,
  onDragEnd,
  onResizeStart,
  draggedTerminalId
}: LayoutRendererProps) => {
  if (node.type === "leaf") {
    const isDragged = node.terminalId === draggedTerminalId;
    return (
      <div 
        className={`w-full h-full relative transition-opacity duration-300`}
        style={isDragged ? { opacity: 0, pointerEvents: 'none' } : { opacity: 1 }}
        onMouseDown={(e) => onResizeStart(e, node.terminalId)}
      >
        <Terminal 
          terminalId={node.terminalId} 
          state={terminalStates[node.terminalId]}
          updateState={(updates) => updateTerminalState(node.terminalId, updates)}
          onDragStart={(e, id) => {
            setDraggedTerminalIdLocal(id);
            onDragStart(e, id);
          }} 
          onDragEnd={() => {
            setDraggedTerminalIdLocal(null);
            onDragEnd();
          }}
          onDrop={(targetId, zone) => {
            if (draggedTerminalIdLocal && draggedTerminalIdLocal !== targetId) {
               window.dispatchEvent(new CustomEvent('bsp-drop', { detail: { targetId, zone, droppedId: draggedTerminalIdLocal } }));
            }
          }} 
        />
      </div>
    );
  }

  const isFirstDragged = node.first.type === "leaf" && node.first.terminalId === draggedTerminalId;
  const isSecondDragged = node.second.type === "leaf" && node.second.terminalId === draggedTerminalId;
  const gapClass = (isFirstDragged || isSecondDragged) ? "gap-0" : "gap-[8px]";

  return (
    <div className={`w-full h-full flex ${node.direction === "horizontal" ? "flex-row" : "flex-col"} ${gapClass} transition-all duration-300 ease-out`}>
      <div 
        className="transition-all duration-300 ease-out min-w-0 min-h-0" 
        style={{ 
          flex: isFirstDragged ? `0.00001 1 0%` : `${node.ratio} 1 0%`,
          opacity: isFirstDragged ? 0 : 1,
          pointerEvents: isFirstDragged ? 'none' : 'auto',
          overflow: 'hidden'
        }}
      >
        <LayoutRenderer node={node.first} terminalStates={terminalStates} updateTerminalState={updateTerminalState} onDragStart={onDragStart} onDrop={onDrop} onDragEnd={onDragEnd} onResizeStart={onResizeStart} draggedTerminalId={draggedTerminalId} />
      </div>
      <div 
        className="transition-all duration-300 ease-out min-w-0 min-h-0" 
        style={{ 
          flex: isSecondDragged ? `0.00001 1 0%` : `${100 - node.ratio} 1 0%`,
          opacity: isSecondDragged ? 0 : 1,
          pointerEvents: isSecondDragged ? 'none' : 'auto',
          overflow: 'hidden'
        }}
      >
        <LayoutRenderer node={node.second} terminalStates={terminalStates} updateTerminalState={updateTerminalState} onDragStart={onDragStart} onDrop={onDrop} onDragEnd={onDragEnd} onResizeStart={onResizeStart} draggedTerminalId={draggedTerminalId} />
      </div>
    </div>
  );
};

export default LayoutRenderer;
