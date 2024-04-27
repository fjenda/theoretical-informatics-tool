import type {TransitionMeta} from "./TransitionMeta";
import type {GraphNodeMeta} from "./GraphNodeMeta";

export type FinInitializationType = {
    type: string,
    nodes: GraphNodeMeta[],
    startState: string[],
    finalStates: string[],
    transitions: TransitionMeta[],
}