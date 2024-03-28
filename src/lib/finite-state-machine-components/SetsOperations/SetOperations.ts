import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";
import type {TransitionMeta} from "../../../types/TransitionMeta";
import {ConvertorToDFA} from "../ConvertorToDFA";

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

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static dfaIntersection = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {

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
                if ((first.startState.includes(firstNode.id) && second.startState.includes(secondNode.id) && (first.finishState.includes(firstNode.id) && second.finishState.includes(secondNode.id)))){
                    classOfNode = "finish start";
                    newStartState.push(indexCounter.toString());
                    newFinishState.push(indexCounter.toString());
                } else if (first.startState.includes(firstNode.id) && second.startState.includes(secondNode.id)){
                    classOfNode = "start";
                    newStartState.push(indexCounter.toString());
                } else if (first.finishState.includes(firstNode.id) && second.finishState.includes(secondNode.id)){
                    classOfNode = "finish";
                    newFinishState.push(indexCounter.toString());
                }

                newNodes.push({id: indexCounter.toString(), label: newLabel, class: classOfNode});
                indexCounter++;
            }
        }

        //make intersection of transitions with same input
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

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static dfaConcatenation = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {

        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let oldFinishState = first.finishState;
        let oldStartState = second.startState;
        let olfFinishStateLabel = first.nodes.find((node) => oldFinishState.includes(node.id)).label;
        let oldStartStateLabel = second.nodes.find((node) => oldStartState.includes(node.id)).label;

        let indexCounter = 0;

        //create new nodes of nodes from first and second no connection
        for(let firstNode of first.nodes){
            let classOfNode = "";
            if (first.startState.includes(firstNode.id)){
                classOfNode = "start";
                newStartState.push(indexCounter.toString());
            }

           newNodes.push({id: indexCounter.toString(), label: firstNode.label, class: classOfNode});
           indexCounter++;
        }

        for(let secondNode of second.nodes){
            let classOfNode = "";
            if (second.finishState.includes(secondNode.id)){
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
            }
            newNodes.push({id: indexCounter.toString(), label: secondNode.label, class: secondNode.class});
            indexCounter++;
        }

        //create transitions from first and second
        for (let firstTransition of first.transitions){
            let transitionStatelabel = firstTransition.stateLabel;
            let transitionStateAfterLabel = firstTransition.stateAfterLabel;
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

        for (let secondTransition of second.transitions){
            let transitionStatelabel = secondTransition.stateLabel;
            let transitionStateAfterLabel = secondTransition.stateAfterLabel;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition : TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: secondTransition.input,
                stack: secondTransition.stack,
                stackAfter: secondTransition.stackAfter,
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        //create transitions from first to second epsilon with old finish state of first to old start state of second
        let transitionStatelabel = olfFinishStateLabel;
        let transitionStateAfterLabel = oldStartStateLabel;
        let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
        let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
        let newTransition : TransitionMeta = {
            state: stateID.toString(),
            stateLabel: transitionStatelabel,
            input: "ε",
            stack: "",
            stackAfter: "",
            stateAfter: stateAfterID.toString(),
            stateAfterLabel: transitionStateAfterLabel
        }
        newTransitions.push(newTransition);


        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static dfaComplement = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        for(let firstNode of first.nodes){
            let classOfNode = "";
            if (first.startState.includes(firstNode.id)){
                classOfNode = "start";
                newFinishState.push(indexCounter.toString());
            }

            if (!first.finishState.includes(firstNode.id)){
                classOfNode = "finish";
                newStartState.push(indexCounter.toString());
            }
            

            newNodes.push({id: indexCounter.toString(), label: firstNode.label, class: classOfNode});
            indexCounter++;
            classOfNode = "";
        }

        for (let firstTransition of first.transitions){
            let transitionStatelabel = firstTransition.stateLabel;
            let transitionStateAfterLabel = firstTransition.stateAfterLabel;
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

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static nfaUnion = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let oldStartStateSecond = first.startState;
        let oldStartStateFirst = second.startState;

        let indexCounter = 0;

        newNodes.push({id: indexCounter.toString(), label: "S", class: "start"});
        indexCounter++;

        for(let firstNode of first.nodes){
            let classOfNode = "";
            if (first.finishState.includes(firstNode.id)){
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
            }
            newNodes.push({id: indexCounter.toString(), label: firstNode.label, class: classOfNode});
            indexCounter++;
        }

        for(let secondNode of second.nodes){
            let classOfNode = "";
            if (second.finishState.includes(secondNode.id)){
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
            }
            newNodes.push({id: indexCounter.toString(), label: secondNode.label, class: classOfNode});
            indexCounter++;
        }


        for (let firstTransition of first.transitions){
            let transitionStatelabel = firstTransition.stateLabel;
            let transitionStateAfterLabel = firstTransition.stateAfterLabel;
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

        for (let secondTransition of second.transitions){
            let transitionStatelabel = secondTransition.stateLabel;
            let transitionStateAfterLabel = secondTransition.stateAfterLabel;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition : TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: secondTransition.input,
                stack: secondTransition.stack,
                stackAfter: secondTransition.stackAfter,
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        for (let oldStartState of oldStartStateFirst){
            let transitionStatelabel = "S";
            let transitionStateAfterLabel = second.nodes.find((node) => node.id === oldStartState).label;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition : TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: "ε",
                stack: "",
                stackAfter: "",
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        for (let oldStartState of oldStartStateSecond){
            let transitionStatelabel = "S";
            let transitionStateAfterLabel = first.nodes.find((node) => node.id === oldStartState).label;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition : TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: "ε",
                stack: "",
                stackAfter: "",
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "NFA");

    }

    static nfaIntersection = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static nfaConcatenation = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return first;
    }

    static nfaComplement = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let toDFAAtomaton = ConvertorToDFA.convertToDFA(first).newFa;
        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        for(let firstNode of toDFAAtomaton.nodes){
            let classOfNode = "";
            if (toDFAAtomaton.startState.includes(firstNode.id)){
                classOfNode = "start";
                newFinishState.push(indexCounter.toString());
            }

            if (!toDFAAtomaton.finishState.includes(firstNode.id)){
                classOfNode = "finish";
                newStartState.push(indexCounter.toString());
            }

            newNodes.push({id: indexCounter.toString(), label: firstNode.label, class: classOfNode});
            indexCounter++;
            classOfNode = "";
        }

        for (let firstTransition of toDFAAtomaton.transitions){
            let transitionStatelabel = firstTransition.stateLabel;
            let transitionStateAfterLabel = firstTransition.stateAfterLabel;
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

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");


    }



}