import type {TransitionMeta} from "./TransitionMeta";
import type {GraphNodeMeta} from "./GraphNodeMeta";

export type InitializationType = {
    type: string,
    nodes: GraphNodeMeta[],
    startState: string,
    finalStates: string[],
    transitions: TransitionMeta[],
}