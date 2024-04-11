import type {TransitionType} from "./TransitionType";
import type {GraphNodeMeta} from "../GraphNodeMeta";

export type InitializationType = {
    type: string,
    nodes: GraphNodeMeta[],
    startState: string,
    finalStates: string[],
    transitions: TransitionType[],
}