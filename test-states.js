let state = { layout: "null", terminalStates: {} };

function setWorkspaces(updater) {
  state = updater({ 1: state })[1];
}

const updateWorkspaceState = (newLayout, newTerminalStates) => {
  setWorkspaces(prev => {
    const activeState = prev[1];
    const updatedLayout = typeof newLayout === 'function' ? newLayout(activeState.layout) : newLayout;
    const updatedTerminalStates = typeof newTerminalStates === 'function' ? newTerminalStates(activeState.terminalStates) : (newTerminalStates || activeState.terminalStates);
    return { 1: { layout: updatedLayout, terminalStates: updatedTerminalStates } };
  });
};

// Press 1 (from empty)
let newId1 = "term-1";
updateWorkspaceState(
  { id: newId1 },
  (prev) => Object.keys(prev).length > 0 ? prev : { [newId1]: { isActive: true } }
);

// Press 2 (rapid, activeId is still null)
let newId2 = "term-2";
updateWorkspaceState(
  { id: newId2 },
  (prev) => Object.keys(prev).length > 0 ? prev : { [newId2]: { isActive: true } }
);

console.log(JSON.stringify(state, null, 2));

