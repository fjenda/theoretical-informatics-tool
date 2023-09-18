type TransitionMetaArray = TransitionMeta[];

export interface ToolbarFunctions {
 addNode : (GraphNodeMeta) => void,
 addEdge : (GraphEdgeMeta) => void,
 addEdgeFromButton : (GraphEdgeMeta) => void,
 zoomIn : () => void,
 zoomOut : () => void,
 toggleDelete : () => void,
 saveGraph : () => void,
 loadGraph : () => void,
 deleteGraph : () => void,
 resetLayout : () => void,
 generateConfiguration : () => void,
 generateGraphFromTransitions : (TransitionMetaArray) => void,
 testInput : (string) => void,
 nextTransition : () => void,
 previousTransition : () => void,
 resetTestInput : () => void,
 getStack : () => string[],
}