import { useState, useCallback, useEffect } from "react";
import { LayoutNode } from "@/components/BSP/bspUtils";

import { ReactNode } from "react";

export interface TerminalLine {
  type: "prompt" | "output" | "neofetch" | "blank";
  user?: string;
  host?: string;
  path?: string;
  command?: string;
  content?: ReactNode;
  delay?: number;
}

export type TerminalState = {
  visibleLines: number;
  activeTab: number;
  isActive: boolean;
  history: TerminalLine[];
  currentInput: string;
};

export type WorkspaceState = {
  layout: LayoutNode | null;
  terminalStates: Record<string, TerminalState>;
};

const initialLayout: LayoutNode | null = null;

export const useWorkspaceManager = () => {
  const [activeWorkspace, setActiveWorkspace] = useState<number>(1);
  const [workspaces, setWorkspaces] = useState<Record<number, WorkspaceState>>({
    1: { layout: initialLayout, terminalStates: {} },
    2: { layout: null, terminalStates: {} },
    3: { layout: null, terminalStates: {} },
    4: { layout: null, terminalStates: {} },
    5: { layout: null, terminalStates: {} },
    6: { layout: null, terminalStates: {} },
    7: { layout: null, terminalStates: {} },
    8: { layout: null, terminalStates: {} },
    9: { layout: null, terminalStates: {} },
  });

  const layout = workspaces[activeWorkspace]?.layout || null;
  const terminalStates = workspaces[activeWorkspace]?.terminalStates || {};

  const updateWorkspaceState = useCallback((
    newLayout: LayoutNode | null | ((prev: LayoutNode | null) => LayoutNode | null),
    newTerminalStates?: Record<string, TerminalState> | ((prev: Record<string, TerminalState>) => Record<string, TerminalState>)
  ) => {
    setWorkspaces(prev => {
      const activeState = prev[activeWorkspace];
      
      const updatedLayout = typeof newLayout === 'function' 
        ? newLayout(activeState.layout) 
        : newLayout;
        
      const updatedTerminalStates = typeof newTerminalStates === 'function'
        ? newTerminalStates(activeState.terminalStates)
        : (newTerminalStates || activeState.terminalStates);

      return {
        ...prev,
        [activeWorkspace]: {
          layout: updatedLayout,
          terminalStates: updatedTerminalStates
        }
      };
    });
  }, [activeWorkspace]);

  // Workspace Sync Listener
  useEffect(() => {
    const handleWorkspaceChange = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (customEvent.detail >= 1 && customEvent.detail <= 9) {
        setActiveWorkspace(customEvent.detail);
      }
    };
    window.addEventListener('workspace-change', handleWorkspaceChange);
    return () => window.removeEventListener('workspace-change', handleWorkspaceChange);
  }, []);

  return {
    activeWorkspace,
    setActiveWorkspace,
    layout,
    terminalStates,
    updateWorkspaceState
  };
};
