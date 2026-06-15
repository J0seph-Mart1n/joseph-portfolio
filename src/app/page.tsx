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

export type TerminalState = {
  visibleLines: number;
  activeTab: number;
  isActive: boolean;
};

export default function Home() {
  const [layout, setLayout] = useState<LayoutNode>(initialLayout);
  
  const [terminalStates, setTerminalStates] = useState<Record<string, TerminalState>>({
    "term-1": { visibleLines: 0, activeTab: 0, isActive: true },
    "term-2": { visibleLines: 0, activeTab: 0, isActive: true },
    "term-3": { visibleLines: 0, activeTab: 0, isActive: true },
  });

  const [draggedTerminalId, setDraggedTerminalId] = useState<string | null>(null);

  const updateTerminalState = (id: string, updates: Partial<TerminalState>) => {
    setTerminalStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

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
  useEffect(() => {
    const onBspDrop = (e: Event) => {
      const { targetId, zone, droppedId } = (e as CustomEvent).detail;
      
      setLayout((prev) => {
        let newLayout = removeNode(prev, droppedId);
        if (!newLayout) return prev;
        return splitNode(newLayout, targetId, droppedId, zone) || newLayout;
      });
      setDraggedTerminalId(null);
    };
    window.addEventListener('bsp-drop', onBspDrop);
    return () => window.removeEventListener('bsp-drop', onBspDrop);
  }, []);

  const handleDragStart = (e: React.DragEvent, terminalId: string) => {
    e.dataTransfer.setData("text/plain", terminalId);
    e.dataTransfer.effectAllowed = "move";
    draggedTerminalIdLocal = terminalId;
    
    // Defer state update so browser drag ghost captures the visible element first
    setTimeout(() => {
      setDraggedTerminalId(terminalId);
    }, 0);
  };

  const handleDragEnd = () => {
    draggedTerminalIdLocal = null;
    setDraggedTerminalId(null);
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
          terminalStates={terminalStates}
          updateTerminalState={updateTerminalState}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={(targetId, zone) => {}}
          draggedTerminalId={draggedTerminalId}
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

let draggedTerminalIdLocal: string | null = null;

const LayoutRenderer = ({ 
  node, 
  terminalStates,
  updateTerminalState,
  onDragStart, 
  onDrop,
  onDragEnd,
  onResizeStart,
  draggedTerminalId
}: { 
  node: LayoutNode;
  terminalStates: Record<string, TerminalState>;
  updateTerminalState: (id: string, updates: Partial<TerminalState>) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (targetId: string, zone: DropZone) => void;
  onDragEnd: () => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  draggedTerminalId: string | null;
}) => {
  if (node.type === "leaf") {
    return (
      <div 
        className="w-full h-full relative"
        onMouseDown={(e) => onResizeStart(e, node.terminalId)}
      >
        <Terminal 
          terminalId={node.terminalId} 
          state={terminalStates[node.terminalId]}
          updateState={(updates) => updateTerminalState(node.terminalId, updates)}
          onDragStart={onDragStart} 
          onDragEnd={onDragEnd}
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

  return (
    <div className={`w-full h-full flex ${node.direction === "horizontal" ? "flex-row" : "flex-col"} gap-[8px]`}>
      <div 
        className="transition-all duration-300 ease-out min-w-0 min-h-0" 
        style={isFirstDragged ? { position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 } : { flex: `${node.ratio} 1 0%` }}
      >
        <LayoutRenderer node={node.first} terminalStates={terminalStates} updateTerminalState={updateTerminalState} onDragStart={onDragStart} onDrop={onDrop} onDragEnd={onDragEnd} onResizeStart={onResizeStart} draggedTerminalId={draggedTerminalId} />
      </div>
      <div 
        className="transition-all duration-300 ease-out min-w-0 min-h-0" 
        style={isSecondDragged ? { position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 } : { flex: `${100 - node.ratio} 1 0%` }}
      >
        <LayoutRenderer node={node.second} terminalStates={terminalStates} updateTerminalState={updateTerminalState} onDragStart={onDragStart} onDrop={onDrop} onDragEnd={onDragEnd} onResizeStart={onResizeStart} draggedTerminalId={draggedTerminalId} />
      </div>
    </div>
  );
};
