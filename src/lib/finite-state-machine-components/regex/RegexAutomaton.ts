import {graph_store} from "../../../stores/graphInitStore";
import type {TransitionMeta} from "../../../types/TransitionMeta";
import {FiniteStateAutomaton} from "../FiniteStateAutomaton";

export class  RegexAutomaton{

    finAut : FiniteStateAutomaton;
    constructor() {};

    regexProcessFunc() : TransitionMeta[] | null {
        const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
            { state: this.finAut.startState, index: 0, path: [] },
        ];






        return null;
    }

}