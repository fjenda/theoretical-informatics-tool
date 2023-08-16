export interface ToolbarFunctions {
 addNode : (GraphNodeMeta) => void,
 addEdge : (GraphEdgeMeta) => void,
 zoomIn : () => void,
 zoomOut : () => void,
 deleteGraphElement : () => void,
 saveGraph : () => void,
 loadGraph : () => void,
 deleteGraph : () => void,
 resetLayout : () => void,
}