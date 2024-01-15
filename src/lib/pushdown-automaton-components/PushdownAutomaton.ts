import type {GraphNodeMeta} from "../../types/GraphNodeMeta";
import type {GraphEdgeDictionary} from "../../types/GraphObject";
import type {TransitionMeta} from "../../types/TransitionMeta";
import type {AutomatonState} from "../../types/AutomatonState";
import type {GraphEdgeMeta} from "../../types/GraphEdgeMeta";

export class PushdownAutomaton {
    graph;
    div: HTMLDivElement;
    status: string;
    nodes: GraphNodeMeta[];
    edges: GraphEdgeDictionary;
    transitions: TransitionMeta[];
    stack: string[];
    currentStatus: AutomatonState;
    word: string[];
    isAccepted: boolean;
    traversal: (GraphNodeMeta | GraphEdgeMeta)[];
    type: string;
    startState: string;
    finishState?: string;

    constructor() {

    }

    process() : TransitionMeta[] | null {
        return null;
    }
}