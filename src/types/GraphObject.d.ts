import type {GraphNodeMeta} from "./GraphNodeMeta";
import type {ConvertorTab} from "./ConvertorTab";

type GraphEdgeDictionary = {
    [key: string] : GraphEdgeMeta[]
}
export interface GraphObject {
    graph; //   cytoscape.js graph object
    div : HTMLDivElement; //   div element containing the graph
    status : string; //   state of the graph
    nodes : GraphNodeMeta[]; //   array of graph nodes
    edges : GraphEdgeDictionary; //   dictionary of graph edges
    transitions : TransitionMeta[]; //   array of graph transitions
    stack : string[]; //   stack of the automaton
    currentStatus : AutomatonState; //   current status of the automaton
    currentStep : number; //   current step of the automaton
    word : string[]; //   word to be processed by the automaton
    isAccepted : boolean; //    if a word is accepted
    traversal : (GraphNodeMeta | GraphEdgeMeta)[]; //   array of graph elements traversed by the automaton
    type : string; //   type of PA (empty/finish) - empty for accepting empty stack, finish for accepting on finish state or both
    startState? : string; //   start state of the automaton
    finishState? : string; //   finish state of the automaton
    generated : boolean,
    regex : string,
    followingID : number, //last used id
    convertDict : ConvertorTab[], //dictionary of conversion tabs
    hideConvertTable : boolean, //show conversion table
    input_alphabet : string[], //input alphabet
    theme : string, //dark theme
}

export type GraphObjectWithoutGraph = Omit<GraphObject, 'graph' | 'div'>;
