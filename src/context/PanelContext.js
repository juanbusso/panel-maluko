import React from "react";

var PanelStateContext = React.createContext();
var PanelDispatchContext = React.createContext();


function PanelProvider({ children, settings }) {
  var [state, dispatch] = React.useState(settings);
  return (
    <PanelStateContext.Provider value={state}>
      <PanelDispatchContext.Provider value={dispatch}>
        {children}
      </PanelDispatchContext.Provider>
    </PanelStateContext.Provider>
  );
}

function usePanelState() {
  var context = React.useContext(PanelStateContext);
  if (context === undefined) {
    throw new Error("usePanelState must be used within a PanelProvider");
  }
  return context;
}

function usePanelDispatch() {
  var context = React.useContext(PanelDispatchContext);
  if (context === undefined) {
    throw new Error("usePanelDispatch must be used within a PanelProvider");
  }
  return context;
}

export { PanelProvider, usePanelState, usePanelDispatch, toggleSidebar };

// ###########################################################
function toggleSidebar(dispatch) {
  dispatch({
    type: "TOGGLE_SIDEBAR",
  });
}
