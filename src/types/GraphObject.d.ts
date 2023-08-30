type GraphEdgeDictionary = {
    [key: string] : GraphEdgeMeta[]
}
export interface GraphObject {
    graph; //   cytoscape.js graph object
    graphDiv : HTMLDivElement; //   div element containing the graph
    graphState : string; //   state of the graph
    graphNodes : GraphNodeMeta[]; //   array of graph nodes
    graphEdges : GraphEdgeDictionary; //   dictionary of graph edges
    graphTransitions : TransitionMeta[]; //   array of graph transitions
    stack : string[]; //   stack of the automaton
    currentStatus : AutomatonState; //   current status of the automaton
    word : string[]; //   word to be processed by the automaton
    graphTraversal : (GraphNodeMeta | GraphEdgeMeta)[]; //   array of graph elements traversed by the automaton
}