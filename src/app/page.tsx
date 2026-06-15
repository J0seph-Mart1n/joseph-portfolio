"use client";

import React, { useState, useRef, useEffect } from "react";
import Waybar from "@/components/Waybar/Waybar";
import Terminal from "@/components/Terminal/Terminal";
import { 
  LayoutNode, 
  removeNode, 
  splitNode, 
  DropZone, 
  getParentSplits, 
  getSplitRatio, 
  updateSplitRatio 
} from "@/components/BSP/bspUtils";

const initialLayout: LayoutNode = {
  id: "root-split",
  type: "split",
  direction: "horizontal",
  ratio: 50,
  first: { id: "leaf-1", type: "leaf", terminalId: "term-1" },
  second: {
    id: "split-2",
    type: "split",
    direction: "vertical",
    ratio: 50,
    first: { id: "leaf-2", type: "leaf", terminalId: "term-2" },
    second: { id: "leaf-3", type: "leaf", terminalId: "term-3" },
  }
};

export default function Home() {
  const [layout, setLayout] = useState<LayoutNode>(initialLayout);
  
  // Resizing state
  const [resizingState, setResizingState] = useState<{
    hSplitId?: string;
    vSplitId?: string;
    startX: number;
    startY: number;
    startHRatio: number | null;
    startVRatio: number | null;
  } | null>(null);
  
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  // Keyboard monitors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Control") setIsCtrlPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === "Control") setIsCtrlPressed(false); };
    const handleBlur = () => setIsCtrlPressed(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Handle Drag & Drop to split/rearrange tiles
  const handleDragStart = (e: React.DragEvent, terminalId: string) => {
    e.dataTransfer.setData("text/plain", terminalId);
  };

  useEffect(() => {
    const handleDropEvent = (e: any) => {
      const { targetId, zone, droppedId } = e.detail;
      
      let newLayout = removeNode(layout, droppedId);
      if (newLayout) {
        newLayout = splitNode(newLayout, targetId, droppedId, zone);
        setLayout(newLayout);
      }
    };
    
    window.addEventListener('bsp-drop', handleDropEvent);
    return () => window.removeEventListener('bsp-drop', handleDropEvent);
  }, [layout]);

  const handleDrop = (targetId: string, zone: DropZone) => {
    // Handled by custom event
  };

  // Resize Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingState || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - resizingState.startX;
      const dy = e.clientY - resizingState.startY;

      let newLayout = layout;

      if (resizingState.hSplitId && resizingState.startHRatio !== null) {
        let newHRatio = resizingState.startHRatio + (dx / rect.width) * 100;
        if (newHRatio < 15) newHRatio = 15;
        if (newHRatio > 85) newHRatio = 85;
        newLayout = updateSplitRatio(newLayout, resizingState.hSplitId, newHRatio);
      }

      if (resizingState.vSplitId && resizingState.startVRatio !== null) {
        let newVRatio = resizingState.startVRatio + (dy / rect.height) * 100;
        if (newVRatio < 15) newVRatio = 15;
        if (newVRatio > 85) newVRatio = 85;
        newLayout = updateSplitRatio(newLayout, resizingState.vSplitId, newVRatio);
      }

      setLayout(newLayout);
    };

    const handleMouseUp = () => setResizingState(null);

    if (resizingState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingState, layout]);

  return (
    <div className="relative w-full h-screen bg-[#1e1e2e] overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
      />
      <Waybar />

      <main 
        ref={containerRef}
        onContextMenu={(e) => { if (e.ctrlKey) e.preventDefault(); }}
        className={`relative z-10 w-full h-[calc(100vh-60px)] mt-[52px] p-[8px] ${(resizingState || isCtrlPressed) ? 'cursor-crosshair select-none' : ''}`}
      >
        <LayoutRenderer 
          node={layout} 
          onDragStart={handleDragStart}
          onDrop={(targetId, zone) => {}}
          onResizeStart={(e, terminalId) => {
            if (e.ctrlKey && e.button === 2) {
              e.preventDefault();
              e.stopPropagation();
              const splits = getParentSplits(layout, terminalId);
              setResizingState({
                hSplitId: splits.hSplitId,
                vSplitId: splits.vSplitId,
                startX: e.clientX,
                startY: e.clientY,
                startHRatio: splits.hSplitId ? getSplitRatio(layout, splits.hSplitId) : null,
                startVRatio: splits.vSplitId ? getSplitRatio(layout, splits.vSplitId) : null,
              });
            }
          }}
        />
      </main>
    </div>
  );
}

// Global variable to hold drag payload since onDrop doesn't have the DragEvent
let draggedTerminalId: string | null = null;

const LayoutRenderer = ({ 
  node, 
  onDragStart, 
  onDrop,
  onResizeStart 
}: { 
  node: LayoutNode;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (targetId: string, zone: DropZone) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
}) => {
  if (node.type === "leaf") {
    return (
      <div 
        className="w-full h-full relative"
        onMouseDown={(e) => onResizeStart(e, node.terminalId)}
      >
        <Terminal 
          terminalId={node.terminalId} 
          onDragStart={(e, id) => {
            draggedTerminalId = id;
            onDragStart(e, id);
          }} 
          onDrop={(targetId, zone) => {
            if (draggedTerminalId && draggedTerminalId !== targetId) {
               // Fire event via window to safely access state, or pass a handler that captures it.
               window.dispatchEvent(new CustomEvent('bsp-drop', { detail: { targetId, zone, droppedId: draggedTerminalId } }));
            }
            draggedTerminalId = null;
          }} 
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex ${node.direction === "horizontal" ? "flex-row" : "flex-col"} gap-[8px]`}>
      <div className="transition-all duration-75 ease-out min-w-0 min-h-0" style={{ flex: `${node.ratio} 1 0%` }}>
        <LayoutRenderer node={node.first} onDragStart={onDragStart} onDrop={onDrop} onResizeStart={onResizeStart} />
      </div>
      <div className="transition-all duration-75 ease-out min-w-0 min-h-0" style={{ flex: `${100 - node.ratio} 1 0%` }}>
        <LayoutRenderer node={node.second} onDragStart={onDragStart} onDrop={onDrop} onResizeStart={onResizeStart} />
      </div>
    </div>
  );
};
