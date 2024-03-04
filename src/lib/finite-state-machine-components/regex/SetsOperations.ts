import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
import type {TransitionMeta} from "../../../types/TransitionMeta";
import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";


export class SetsOperations {

    static union(first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton{
        const start : GraphNodeMeta = {id: "0", label: "q0", class: "start"};

        first.addEpsilonTransition(start.id, start.label, first.startState[0], "q" + first.startState[0]);
        first.addEpsilonTransition(start.id, start.label, second.startState[0], "q" + second.startState[0]);

        const end : GraphNodeMeta = {id: "1", label: "q1", class: "finish"};

        // const nodes: GraphNodeMeta[] = [];
        // const transitions: TransitionMeta[] = [];
        // // const epsilons: Map<number, number[]> = new Map();
        // let startNode : GraphNodeMeta = {id: "0", label: "q0",class: "start"}
        // nodes.push(startNode);
        //
        // let nodesFirst = first.getNodes();
        // let nodesCount = nodes.length;
        //
        // for (let i = 0; i < nodesFirst.length; i++) {
        //     nodes.push({id: (i + nodesCount).toString(), label: "q" + (i + nodesCount).toString()});
        // }
        //
        // let transitionsFirst = first.getTransitions();
        // for (let i = 0; i < transitionsFirst.length; i++) {
        //     transitions.push({
        //         state: transitionsFirst[i].state,
        //         stateLabel:
        //
        //     }




        return null;
    }

    static concatenation(first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton{

        return null;
    }

    static closer(first : FiniteStateAutomaton) : FiniteStateAutomaton{
        return null;
    }

    static onoOrMore(first : FiniteStateAutomaton) : FiniteStateAutomaton{
        return null;
    }

    static ZeroOrOne(first : FiniteStateAutomaton) : FiniteStateAutomaton{
        return null;
    }




}