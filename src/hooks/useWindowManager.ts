import { useState, useRef, useEffect, useCallback } from "react";
import { 
  LayoutNode, 
  removeNode, 
  splitNode, 
  DropZone, 
  getParentSplits, 
  getSplitRatio, 
  updateSplitRatio 
} from "@/components/BSP/bspUtils";
import { useWorkspaceManager, TerminalState } from "./useWorkspaceManager";
export type { TerminalState };

const MAX_WINDOWS = 8;

export const useWindowManager = (containerRef: React.RefObject<HTMLElement | null>) => {
  const { 
    setActiveWorkspace, 
    layout, 
    terminalStates, 
    updateWorkspaceState 
  } = useWorkspaceManager();

  const [draggedTerminalId, setDraggedTerminalId] = useState<string | null>(null);
  const [ghostConfig, setGhostConfig] = useState<{w: number, h: number, x: number, y: number} | null>(null);
  const ghostPosRef = useRef({ x: 0, y: 0 });
  const ghostRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const updateTerminalState = useCallback((id: string, updates: Partial<TerminalState>) => {
    updateWorkspaceState((prevLayout) => prevLayout, (prev) => {
      if (updates.isActive === true) {
        const next = { ...prev };
        for (const key in next) {
          next[key] = { ...next[key], isActive: key === id };
        }
        return { ...next, [id]: { ...prev[id], ...updates } };
      }
      return {
        ...prev,
        [id]: { ...prev[id], ...updates }
      };
    });
  }, [updateWorkspaceState]);

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

  const terminalStatesRef = useRef(terminalStates);
  const layoutRef = useRef(layout);
  useEffect(() => {
    terminalStatesRef.current = terminalStates;
    layoutRef.current = layout;
  }, [terminalStates, layout]);

  // Keyboard monitors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.key === "Control") setIsCtrlPressed(true); 

      // Support Shift+Number globally to switch workspaces here too
      if (e.shiftKey && e.code.startsWith('Digit')) {
        const digit = parseInt(e.code.replace('Digit', ''), 10);
        if (digit >= 1 && digit <= 9) {
          e.preventDefault();
          setActiveWorkspace(digit);
          window.dispatchEvent(new CustomEvent('workspace-change', { detail: digit }));
          return;
        }
      }

      if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.code === 'KeyT' || e.code === 'KeyQ') {
          e.preventDefault();
          const states = terminalStatesRef.current;
          const currentLayout = layoutRef.current;
          const activeId = Object.keys(states).find(id => states[id].isActive);

          if (e.code === 'KeyT') {
            if (Object.keys(states).length >= MAX_WINDOWS) return; // Enforce limit

            // Adding a random portion makes newId perfectly unique even for sub-millisecond macro repeats
            const newId = `term-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            
            if (!activeId || !currentLayout) {
              // No windows exist — create a fresh one
              updateWorkspaceState(
                (prevLayout) => prevLayout ? prevLayout : { id: newId, type: "leaf", terminalId: newId },
                (prev) => Object.keys(prev).length > 0 ? prev : { [newId]: { visibleLines: 0, activeTab: 0, isActive: true } }
              );
              return;
            }

            const el = document.getElementById(activeId);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            
            const mouseX = mousePosRef.current.x;
            const mouseY = mousePosRef.current.y;
            
            let zone: DropZone;
            if (rect.width >= rect.height) {
              zone = mouseX < rect.left + rect.width / 2 ? "left" : "right";
            } else {
              zone = mouseY < rect.top + rect.height / 2 ? "top" : "bottom";
            }
            
            updateWorkspaceState(
              (prevLayout) => prevLayout ? (splitNode(prevLayout, activeId, newId, zone) || prevLayout) : { id: newId, type: "leaf", terminalId: newId },
              (prev) => {
                const next = { ...prev };
                for (const k in next) next[k] = { ...next[k], isActive: false };
                return { ...next, [newId]: { visibleLines: 0, activeTab: 0, isActive: true } };
              }
            );
            
          } else if (e.code === 'KeyQ') {
            if (!activeId) return;
            
            updateWorkspaceState(
              (prevLayout) => prevLayout ? removeNode(prevLayout, activeId) : prevLayout,
              (prev) => {
                const next = { ...prev };
                delete next[activeId];
                const first = Object.keys(next)[0];
                if (first) next[first] = { ...next[first], isActive: true };
                return next;
              }
            );
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === "Control") setIsCtrlPressed(false); };
    const handleBlur = () => setIsCtrlPressed(false);
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("mousemove", handleMouseMoveGlobal);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
    };
  }, [updateWorkspaceState]);

  // Re-evaluate focus when layout changes
  useEffect(() => {
    const checkFocus = () => {
      const el = document.elementFromPoint(mousePosRef.current.x, mousePosRef.current.y);
      if (el) {
        const term = el.closest('[data-terminal-id]');
        if (term) {
          const termId = term.getAttribute('data-terminal-id');
          const currentStates = terminalStatesRef.current;
          if (termId && currentStates[termId] && !currentStates[termId].isActive) {
            updateTerminalState(termId, { isActive: true });
          }
        }
      }
    };
    
    const t1 = setTimeout(checkFocus, 50);
    const t2 = setTimeout(checkFocus, 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [layout, updateTerminalState]);

  // Handle Drag & Drop to split/rearrange tiles
  useEffect(() => {
    const onBspDrop = (e: Event) => {
      const { targetId, zone, droppedId } = (e as CustomEvent).detail;
      
      updateWorkspaceState((prevLayout) => {
        if (!prevLayout) return prevLayout;
        const newLayout = removeNode(prevLayout, droppedId);
        if (!newLayout) return prevLayout;
        return splitNode(newLayout, targetId, droppedId, zone) || newLayout;
      });
      setDraggedTerminalId(null);
      setGhostConfig(null);
    };
    window.addEventListener('bsp-drop', onBspDrop);
    
    const handleGlobalDragOver = (e: DragEvent) => {
      if (ghostRef.current) {
        const x = e.clientX - ghostPosRef.current.x;
        const y = e.clientY - ghostPosRef.current.y;
        ghostRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };
    window.addEventListener("dragover", handleGlobalDragOver);
    
    return () => {
      window.removeEventListener('bsp-drop', onBspDrop);
      window.removeEventListener("dragover", handleGlobalDragOver);
    };
  }, [updateWorkspaceState]);

  const handleDragStart = useCallback((e: React.DragEvent, terminalId: string) => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);

    e.dataTransfer.setData("text/plain", terminalId);
    e.dataTransfer.effectAllowed = "move";

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    ghostPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setGhostConfig({
      w: rect.width,
      h: rect.height,
      x: rect.left,
      y: rect.top
    });
    
    setTimeout(() => {
      setDraggedTerminalId(terminalId);
    }, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTerminalId(null);
    setGhostConfig(null);
  }, []);

  // Resize Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingState || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - resizingState.startX;
      const dy = e.clientY - resizingState.startY;

      let newLayout = layout;
      if (!newLayout) return;

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

      updateWorkspaceState(newLayout);
    };

    const handleMouseUp = () => {
      setResizingState(null);
    };

    if (resizingState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingState, layout, containerRef, updateWorkspaceState]);

  const handleResizeStart = useCallback((e: React.MouseEvent, terminalId: string) => {
    if (e.ctrlKey && e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      if (!layout) return;
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
  }, [layout]);

  return {
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
  };
};
