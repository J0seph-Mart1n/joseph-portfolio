"use client";

import React, { useRef } from "react";
import Waybar from "@/components/Waybar/Waybar";
import LayoutRenderer from "@/components/BSP/LayoutRenderer";
import { useWindowManager } from "@/hooks/useWindowManager";

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);
  
  const {
    layout,
    terminalStates,
    updateTerminalState,
    draggedTerminalId,
    ghostConfig,
    ghostRef,
    handleDragStart,
    handleDragEnd,
    handleResizeStart,
    resizingState,
    isCtrlPressed
  } = useWindowManager(containerRef);

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
        {layout ? (
          <LayoutRenderer 
            node={layout} 
            terminalStates={terminalStates}
            updateTerminalState={updateTerminalState}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={() => {}}
            draggedTerminalId={draggedTerminalId}
            onResizeStart={handleResizeStart}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6c7086] text-lg font-mono">
            Press Shift + T to open a new window
          </div>
        )}
        {draggedTerminalId && ghostConfig && (
          <div
            ref={ghostRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: ghostConfig.w,
              height: ghostConfig.h,
              pointerEvents: 'none',
              zIndex: 9999,
              opacity: 0.5,
            }}
          >
            <div className="w-full h-full border-2 border-dashed border-[#89b4fa] rounded-lg bg-[#1e1e2e]/50" />
          </div>
        )}
      </main>
    </div>
  );
}
