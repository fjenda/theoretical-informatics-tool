import type {TransitionMeta} from "./TransitionMeta";
import type {GraphNodeMeta} from "./GraphNodeMeta";

export type FinInitializationType = {
    type: string,
    nodes: GraphNodeMeta[],
    startState: string[],
    finishState: string[],
    transitions: TransitionMeta[],
    input_alphabet: string[],
    followingID: number,
}