type TransitionMetaArray = TransitionMeta[];

export interface ToolbarFunctions {
 addNode : (GraphNodeMeta) => void,
 addEdge : (GraphEdgeMeta) => void,
 zoomIn : () => void,
 zoomOut : () => void,
 toggleDelete : () => void,
 saveGraph : () => void,
 loadGraph : () => void,
 deleteGraph : () => void,
 resetLayout : () => void,
 generateGraphFromTransitions : (TransitionMetaArray) => void,
 testInput : (string) => void,
 nextTransition : () => void,
 previousTransition : () => void,
 resetTestInput : () => void,
 showTransitions : () => void,
 generateAutomata : (AutomataMeta) => void,
}