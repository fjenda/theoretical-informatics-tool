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

        newNodes.push({id: indexCounter.toString(), label: "S", class: "start"});
        indexCounter++;
        newStartState.push("0");

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
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        for (let oldStartState of first.startState){
           let transitionsFromOldStart = first.transitions.filter((transition) =>
               transition.stateLabel === first.nodes.find((node) => node.id === oldStartState).label);
              for (let transition of transitionsFromOldStart){
                    let transitionStatelabel = "S";
                    let transitionStateAfterLabel = transition.stateAfterLabel;
                    let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                    let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: transition.input,
                        stateAfter: stateAfterID.toString(),
                        stateAfterLabel: transitionStateAfterLabel
                    }
                    newTransitions.push(newTransition);
              }
        }

        for (let oldStartState of second.startState){
            let transitionsFromOldStart = second.transitions.filter((transition) =>
                transition.stateLabel === second.nodes.find((node) => node.id === oldStartState).label);
            for (let transition of transitionsFromOldStart){
                let transitionStatelabel = "S";
                let transitionStateAfterLabel = transition.stateAfterLabel;
                let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                let newTransition : TransitionMeta = {
                    state: stateID.toString(),
                    stateLabel: transitionStatelabel,
                    input: transition.input,
                    stateAfter: stateAfterID.toString(),
                    stateAfterLabel: transitionStateAfterLabel
                }
                newTransitions.push(newTransition);
            }
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "NFA");



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

        newStartState.push("0");

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
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "NFA");

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

                newNodes.push({id: indexCounter.toString(), label: "["+newLabel+"]", class: classOfNode});
                indexCounter++;
            }
        }

        //make intersection of transitions with same input
        for (let firstTransition of first.transitions){
            for (let secondTransition of second.transitions){
                if (firstTransition.input === secondTransition.input){
                    let transitionStatelabel = "["+firstTransition.stateLabel + "," + secondTransition.stateLabel+"]";
                    let transitionStateAfterLabel = "["+firstTransition.stateAfterLabel + "," + secondTransition.stateAfterLabel+"]";
                    let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                    let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: firstTransition.input,
                        stateAfter: stateAfterID.toString(),
                        stateAfterLabel: transitionStateAfterLabel
                    }
                    newTransitions.push(newTransition);
                }
            }
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static nfaIntersection = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let firstDfa = first;
        let secondDfa = second;

        if(first.type == "NFA"){
            firstDfa = ConvertorToDFA.convertToDFA(first).newFa;
        }
        if(second.type == "NFA"){
            secondDfa = ConvertorToDFA.convertToDFA(second).newFa;
        }

        //in first dfa change label of states from q to p and Ø to X
        for (let node of firstDfa.nodes){
            node.label = node.label.replace("q", "p");
            node.label = node.label.replace("Ø", "X");
        }

        //in first dfa change label of transitions from q to p and Ø to X
        for (let transition of firstDfa.transitions){
            transition.stateLabel = transition.stateLabel.replace("q", "p");
            transition.stateLabel = transition.stateLabel.replace("Ø", "X");
            transition.stateAfterLabel = transition.stateAfterLabel.replace("q", "p");
            transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "X");
        }

        //in first dfa change label of states from q to p and Ø to X
        for (let node of secondDfa.nodes){
            node.label = node.label.replace("Ø", "Y");
        }

        //in first dfa change label of transitions from q to p and Ø to X
        for (let transition of secondDfa.transitions){
            transition.stateLabel = transition.stateLabel.replace("Ø", "Y");
            transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "Y");
        }

        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        for( let firstNode of firstDfa.nodes){
            let newNode = firstNode.label;
            for (let secondNode of secondDfa.nodes){
                let newLabel = newNode + ","+ secondNode.label;
                let classOfNode= "";
                if ((firstDfa.startState.includes(firstNode.id) && secondDfa.startState.includes(secondNode.id) && (firstDfa.finishState.includes(firstNode.id) && secondDfa.finishState.includes(secondNode.id)))){
                    classOfNode = "finish start";
                    newStartState.push(indexCounter.toString());
                    newFinishState.push(indexCounter.toString());
                } else if (firstDfa.startState.includes(firstNode.id) && secondDfa.startState.includes(secondNode.id)){
                    classOfNode = "start";
                    newStartState.push(indexCounter.toString());
                } else if (firstDfa.finishState.includes(firstNode.id) && secondDfa.finishState.includes(secondNode.id)){
                    classOfNode = "finish";
                    newFinishState.push(indexCounter.toString());
                }

                newNodes.push({id: indexCounter.toString(), label: "["+newLabel+"]", class: classOfNode});
                indexCounter++;
            }
        }

        //make intersection of transitions with same input
        for (let firstTransition of firstDfa.transitions){
            for (let secondTransition of secondDfa.transitions){
                if (firstTransition.input === secondTransition.input){
                    let transitionStatelabel = "["+firstTransition.stateLabel + "," + secondTransition.stateLabel+"]";
                    let transitionStateAfterLabel =  "["+firstTransition.stateAfterLabel + "," + secondTransition.stateAfterLabel+"]";
                    let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                    let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: firstTransition.input,
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

        let newNodes: GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState: string[] = [];
        let newFinishState: string[] = [];
        let oldFinishState = first.finishState;
        let oldStartState = second.startState;
        let oldFinishStateLabel = first.nodes.find((node) => oldFinishState.includes(node.id)).label;
        let oldStartStateLabel = second.nodes.find((node) => oldStartState.includes(node.id)).label;

        let indexCounter = 0;

        //find if second start state is also finish state
        let startStateIsFinish = false;
        for (let finishState of second.finishState) {
            if (second.startState.includes(finishState)) {
                startStateIsFinish = true;
                break;
            }
        }

        //create new nodes of nodes from first and second no connection
        for (let firstNode of first.nodes) {
            let classOfNode = "";
            if (first.startState.includes(firstNode.id)) {
                classOfNode = "start";
                newStartState.push(indexCounter.toString());
            }

            if (startStateIsFinish) {

                if (first.finishState.includes(firstNode.id)) {
                    classOfNode = "finish";
                    newFinishState.push(indexCounter.toString());
                }
            }

            newNodes.push({id: indexCounter.toString(), label: firstNode.label, class: classOfNode});
            indexCounter++;
        }

        for (let secondNode of second.nodes) {
            let classOfNode = "";
            if (second.finishState.includes(secondNode.id)) {
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
            }
            newNodes.push({id: indexCounter.toString(), label: secondNode.label, class: secondNode.class});
            indexCounter++;
        }

        //create transitions from first and second
        for (let firstTransition of first.transitions) {
            let transitionStatelabel = firstTransition.stateLabel;
            let transitionStateAfterLabel = firstTransition.stateAfterLabel;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition: TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: firstTransition.input,
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        for (let secondTransition of second.transitions) {
            let transitionStatelabel = secondTransition.stateLabel;
            let transitionStateAfterLabel = secondTransition.stateAfterLabel;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition: TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: secondTransition.input,
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        //filter transitions from second that are from start state
        let transitionsFromSecStart = second.transitions.filter((transition) =>
            transition.stateLabel === oldStartStateLabel);

        for (let transition of transitionsFromSecStart) {
            let transitionStatelabel = oldFinishStateLabel;
            let transitionStateAfterLabel = transition.stateAfterLabel;
            let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
            let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
            let newTransition: TransitionMeta = {
                state: stateID.toString(),
                stateLabel: transitionStatelabel,
                input: transition.input,
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }



    static nfaConcatenation = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
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
            stateAfter: stateAfterID.toString(),
            stateAfterLabel: transitionStateAfterLabel
        }
        newTransitions.push(newTransition);


        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "NFA");
    }

    static dfaComplement = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        if(!SetOperations.checkIfTotalDfa(first)) {
            first = ConvertorToDFA.convertToDFA(first).newFa;

            for (let node of first.nodes){
                node.label = node.label.replace("q", "p");
                node.label = node.label.replace("Ø", "X");
            }

            for (let transition of first.transitions){
                transition.stateLabel = transition.stateLabel.replace("q", "p");
                transition.stateLabel = transition.stateLabel.replace("Ø", "X");
                transition.stateAfterLabel = transition.stateAfterLabel.replace("q", "p");
                transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "X");
            }
        }

        for(let firstNode of first.nodes){
            let classOfNode = "";
            if (first.startState.includes(firstNode.id)){
                classOfNode = "start";
                newStartState.push(indexCounter.toString());
            }

            if (!first.finishState.includes(firstNode.id)){
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
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
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
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
                newStartState.push(indexCounter.toString());
            }

            if (!toDFAAtomaton.finishState.includes(firstNode.id)){
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
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
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");


    }

    static dfaDifference = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {

        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        if(!SetOperations.checkIfTotalDfa(first)) {
            first = ConvertorToDFA.convertToDFA(first).newFa;

            for (let node of first.nodes){
                node.label = node.label.replace("q", "p");
                node.label = node.label.replace("Ø", "X");
            }


            for (let transition of first.transitions){
                transition.stateLabel = transition.stateLabel.replace("q", "p");
                transition.stateLabel = transition.stateLabel.replace("Ø", "X");
                transition.stateAfterLabel = transition.stateAfterLabel.replace("q", "p");
                transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "X");
            }
        }

        if(!SetOperations.checkIfTotalDfa(second)) {
            second = ConvertorToDFA.convertToDFA(second).newFa;

            for (let node of second.nodes){
                node.label = node.label.replace("Ø", "Y");
            }


            for (let transition of second.transitions){
                transition.stateLabel = transition.stateLabel.replace("Ø", "Y");
                transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "Y");
            }
        }

        for( let firstNode of first.nodes){
            let newNode = firstNode.label;
            for (let secondNode of second.nodes){
                let newLabel = newNode + ","+ secondNode.label;
                let classOfNode= "";
                if ((first.startState.includes(firstNode.id) && second.startState.includes(secondNode.id) && (first.finishState.includes(firstNode.id) && !second.finishState.includes(secondNode.id)))){
                    classOfNode = "finish start";
                    newStartState.push(indexCounter.toString());
                    newFinishState.push(indexCounter.toString());
                } else if (first.startState.includes(firstNode.id) && second.startState.includes(secondNode.id)){
                    classOfNode = "start";
                    newStartState.push(indexCounter.toString());
                } else if (first.finishState.includes(firstNode.id) && !second.finishState.includes(secondNode.id)){
                    classOfNode = "finish";
                    newFinishState.push(indexCounter.toString());
                }

                newNodes.push({id: indexCounter.toString(), label: "["+newLabel+"]", class: classOfNode});
                indexCounter++;
            }
        }

        //make intersection of transitions with same input
        for (let firstTransition of first.transitions){
            for (let secondTransition of second.transitions){
                if (firstTransition.input === secondTransition.input){
                    let transitionStatelabel = "["+firstTransition.stateLabel + "," + secondTransition.stateLabel+"]";
                    let transitionStateAfterLabel = "["+firstTransition.stateAfterLabel + "," + secondTransition.stateAfterLabel+"]";
                    let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                    let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: firstTransition.input,
                        stateAfter: stateAfterID.toString(),
                        stateAfterLabel: transitionStateAfterLabel
                    }
                    newTransitions.push(newTransition);
                }
            }
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }
    static nfaDifference = (first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let firstDfa = first;
        let secondDfa = second;

        if(first.type == "NFA"){
            firstDfa = ConvertorToDFA.convertToDFA(first).newFa;
        }
        if(second.type == "NFA"){
            secondDfa = ConvertorToDFA.convertToDFA(second).newFa;
        }

        //in first dfa change label of states from q to p and Ø to X
        for (let node of firstDfa.nodes){
            node.label = node.label.replace("q", "p");
            node.label = node.label.replace("Ø", "X");
        }

        //in first dfa change label of transitions from q to p and Ø to X
        for (let transition of firstDfa.transitions){
            transition.stateLabel = transition.stateLabel.replace("q", "p");
            transition.stateLabel = transition.stateLabel.replace("Ø", "X");
            transition.stateAfterLabel = transition.stateAfterLabel.replace("q", "p");
            transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "X");
        }

        //in first dfa change label of states from q to p and Ø to X
        for (let node of secondDfa.nodes){
            node.label = node.label.replace("Ø", "Y");
        }

        //in first dfa change label of transitions from q to p and Ø to X
        for (let transition of secondDfa.transitions){
            transition.stateLabel = transition.stateLabel.replace("Ø", "Y");
            transition.stateAfterLabel = transition.stateAfterLabel.replace("Ø", "Y");
        }

        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        for( let firstNode of firstDfa.nodes){
            let newNode = firstNode.label;
            for (let secondNode of secondDfa.nodes){
                let newLabel = newNode + ","+ secondNode.label;
                let classOfNode= "";
                if ((firstDfa.startState.includes(firstNode.id) && secondDfa.startState.includes(secondNode.id) && (firstDfa.finishState.includes(firstNode.id) && !secondDfa.finishState.includes(secondNode.id)))){
                    classOfNode = "finish start";
                    newStartState.push(indexCounter.toString());
                    newFinishState.push(indexCounter.toString());
                } else if (firstDfa.startState.includes(firstNode.id) && secondDfa.startState.includes(secondNode.id)){
                    classOfNode = "start";
                    newStartState.push(indexCounter.toString());
                } else if (firstDfa.finishState.includes(firstNode.id) && !secondDfa.finishState.includes(secondNode.id)){
                    classOfNode = "finish";
                    newFinishState.push(indexCounter.toString());
                }

                newNodes.push({id: indexCounter.toString(), label: "["+newLabel+"]", class: classOfNode});
                indexCounter++;
            }
        }

        //make intersection of transitions with same input
        for (let firstTransition of firstDfa.transitions){
            for (let secondTransition of secondDfa.transitions){
                if (firstTransition.input === secondTransition.input){
                    let transitionStatelabel = "["+firstTransition.stateLabel + "," + secondTransition.stateLabel+"]";
                    let transitionStateAfterLabel = "["+firstTransition.stateAfterLabel + "," + secondTransition.stateAfterLabel+"]";
                    let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                    let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: firstTransition.input,
                        stateAfter: stateAfterID.toString(),
                        stateAfterLabel: transitionStateAfterLabel
                    }
                    newTransitions.push(newTransition);
                }
            }
        }

        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");

    }

    static dfaIteration = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        let newNodes : GraphNodeMeta[] = [];
        let newTransitions: TransitionMeta[] = [];
        let newStartState : string[] = [];
        let newFinishState : string[] = [];
        let indexCounter = 0;

        newNodes.push({id: indexCounter.toString(), label: "S", class: "start"});
        indexCounter++;
        newStartState.push("0");

        newFinishState.push("0");

        for(let firstNode of first.nodes){
            let classOfNode = "";
            if (first.finishState.includes(firstNode.id)){
                classOfNode = "finish";
                newFinishState.push(indexCounter.toString());
            }
            newNodes.push({id: indexCounter.toString(), label: firstNode.label, class: classOfNode});
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
                stateAfter: stateAfterID.toString(),
                stateAfterLabel: transitionStateAfterLabel
            }
            newTransitions.push(newTransition);
        }

        for (let oldStartState of first.startState) {
            let transitionsFromOldStart = first.transitions.filter((transition) =>
                transition.stateLabel === first.nodes.find((node) => node.id === oldStartState).label);
            for (let transition of transitionsFromOldStart) {
                let transitionStatelabel = "S";
                let transitionStateAfterLabel = transition.stateAfterLabel;
                let stateID = newNodes.findIndex((node) => node.label === transitionStatelabel);
                let stateAfterID = newNodes.findIndex((node) => node.label === transitionStateAfterLabel);
                let newTransition: TransitionMeta = {
                    state: stateID.toString(),
                    stateLabel: transitionStatelabel,
                    input: transition.input,
                    stateAfter: stateAfterID.toString(),
                    stateAfterLabel: transitionStateAfterLabel
                }
                newTransitions.push(newTransition);

                for (let endStates of newFinishState){
                    if (endStates == "0") {
                        continue;
                    }
                    let transitionStatelabel = newNodes.find((node) => node.id === endStates).label;
                    let transitionStateAfterLabel = transition.stateAfterLabel;
                    let stateID = newNodes.find((node) => node.label === transitionStatelabel).id;
                    let stateAfterID = newNodes.find((node) => node.label === transitionStateAfterLabel).id;
                    let newTransition : TransitionMeta = {
                        state: stateID.toString(),
                        stateLabel: transitionStatelabel,
                        input: transition.input,
                        stateAfter: stateAfterID.toString(),
                        stateAfterLabel: transitionStateAfterLabel
                    }
                    newTransitions.push(newTransition);

                }
            }
        }

        //remove duplicates from newTransitions
        newTransitions = newTransitions.filter((thing, index, self) =>
            index === self.findIndex((t) => (
                t.state === thing.state && t.stateAfter === thing.stateAfter && t.input === thing.input
            ))
        )



        return new FiniteStateAutomaton(newNodes, newTransitions, newStartState, newFinishState, "DFA");
    }

    static nfaIteration = (first : FiniteStateAutomaton) : FiniteStateAutomaton => {
        return null;
    }

    static checkIfDfa = (automaton : FiniteStateAutomaton) : boolean => {
        let isDfa = true;
        for (let transition of automaton.transitions){
            let state = automaton.nodes.find((node) => node.id === transition.state).label;
            let stateAfter = automaton.nodes.find((node) => node.id === transition.stateAfter).label;
            let transitions = automaton.transitions.filter
            ((t) => t.stateLabel === state && t.input === transition.input);
            if (transitions.length > 1){
                isDfa = false;
            }
            if (transition.input === "ε"){
                isDfa = false;
            }
        }
        return isDfa;
    }

    static checkIfTotalDfa = (automaton : FiniteStateAutomaton) : boolean => {
        let isDfa = true;
        for (let node of automaton.nodes){
            let transitions = automaton.transitions.filter
            ((t) => t.stateLabel === node.label);
            if (transitions.length < automaton.input_alphabet.length){
                isDfa = false;
            }
        }
        return isDfa;
    }



}