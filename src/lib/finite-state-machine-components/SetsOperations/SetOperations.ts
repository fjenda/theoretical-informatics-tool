import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";
import type {TransitionMeta} from "../../../types/TransitionMeta";

export class SetOperations{

    static dfaUnion = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;
        for( let firstNode of first.nodes){
            let newNode = firstNode.label;
            for (let secondNode of second.nodes){
                let newLabel = newNode + ","+ secondNode.label;
                let classOfNode= "";
                if ((first.startState.includes(firstNode.id) && second.startState.includes(secondNode.id) && (first.finishState.includes(firstNode.id) || second.finishState.includes(secondNode.id)))){
                    classOfNode = "finish start";
                    newStartState.push(indexCounter.toString());
                    newFinishState.push(indexCounter.toString());
                } else if (first.startState.includes(firstNode.id) && second.startState.includes(secondNode.id)){
                    classOfNode = "start";
                    newStartState.push(indexCounter.toString());
                } else if (first.finishState.includes(firstNode.id) || second.finishState.includes(secondNode.id)){
                    classOfNode = "finish";
                    newFinishState.push(indexCounter.toString());
                }

                newNodes.push({id: indexCounter.toString(), label: newLabel, class: classOfNode});
                indexCounter++;
            }
        }

        //make union of transitions with same input
        for (let firstTransition of first.transitions){
            for (let secondTransition of second.transitions){
                if (firstTransition.input === secondTransition.input){
                    let transitionStatelabel = firstTransition.stateLabel + "," + secondTransition.stateLabel;
                    let transitionStateAfterLabel = firstTransition.stateAfterLabel + "," + secondTransition.stateAfterLabel;
                    let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                    let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: firstTransition.input,
                        stack: firstTransition.stack,
                        stackAfter: firstTransition.stackAfter,
                        stateAfter: stateAfterID.toString(),
                        stateAfterLabel: transitionStateAfterLabel
                    }
                    newTransitions.push(newTransition);
                }
            }
        }

        console.log("NEW NODES: ", newNodes);
        console.log("NEW TRANSITIONS: ", newTransitions);
        console.log("NEW START STATE: ", newStartState);
        console.log("NEW FINISH STATE: ", newFinishState);

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static dfaIntersection = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static dfaConcatenation = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static dfaComplement = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static nfaUnion = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static nfaIntersection = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static nfaConcatenation = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static nfaComplement = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }



}