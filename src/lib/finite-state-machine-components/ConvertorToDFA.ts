import type {TransitionMeta} from "../../types/TransitionMeta";
import type {GraphNodeMeta} from "../../types/GraphNodeMeta";
import {FiniteStateAutomaton} from "./FiniteStateAutomaton";
import type {ConvertorTab} from "../../types/ConvertorTab";

export class ConvertorToDFA  {

    static generateConverTable = (stateRecorder: Map<string, number>, nfaAutomaton : FiniteStateAutomaton ): ConvertorTab => {
        let alphabet = nfaAutomaton.input_alphabet;
        let statesForInput : string = "";
        let stateResult : string[] = [];
        let newConvertorTab : ConvertorTab[] = [];
        let startState = false;
        let finishState = false;

        if (alphabet.includes("ε")) {
            alphabet = alphabet.filter(item => item !== "ε");
        }
        for(let key of stateRecorder.keys()){
            let parseKeys = key.split(",");
            for(let c of alphabet){
                for(let id of parseKeys){
                    for (let i = 0; i < parseKeys.length; i++){
                        if (!nfaAutomaton.transitions.some(transition => transition.state == id.toString())) {
                            continue;
                        }
                        let endStates: number[] = nfaAutomaton.transitions.filter(transition => transition.input === c && transition.state == id.toString()).map(transition => Number(transition.stateAfter));
                        if (endStates.length === 0) {
                            continue;
                        }

                        this.expendCurrentStates(endStates, nfaAutomaton);

                        //convert endStates to string divered by ","
                        statesForInput = ConvertorToDFA.buildStateKey(endStates);

                        if (statesForInput === "{}") {
                            statesForInput = "Ø";
                        }
                    }

                }
                let splitedStates = statesForInput.split(",");
                let newSplitedStates = "";
                for(let split of splitedStates){
                    nfaAutomaton.nodes.forEach(node => {
                        if(node.id === split){
                            if (newSplitedStates){
                                newSplitedStates += ", " + node.label;
                            } else {
                                newSplitedStates = node.label;
                            }
                        }
                    });
                }

                stateResult.push("{"+newSplitedStates+"}");
                statesForInput = "";
                newSplitedStates = "";
            }
            for(let nodeID of parseKeys){
                if(nfaAutomaton.startState.includes(nodeID)){
                    startState = true;
                }
                if(nfaAutomaton.finishState.includes(nodeID)){
                    finishState = true;
                }
            }
            let newKey = "";
            for(let id of parseKeys){
                nfaAutomaton.nodes.forEach(node => {
                    if(node.id === id){
                        if(newKey){
                            newKey += ", " + node.label;
                        } else {
                            newKey = node.label;
                        }
                    }
                });
            }

            if(startState && finishState){
                newConvertorTab.push({key:  "<-->q" + stateRecorder.get(key).toString() + "{"+newKey+"}", values: stateResult});
                startState = false;
                finishState = false;
            } else if(startState){
                newConvertorTab.push({key:  "->q" + stateRecorder.get(key).toString() + "{"+newKey+"}", values: stateResult});
                startState = false;
                finishState = false;
            } else if(finishState){
                newConvertorTab.push({key:  "<-q" + stateRecorder.get(key).toString() + "{"+newKey+"}", values: stateResult});
                finishState = false;
                startState = false;
            } else {
                newConvertorTab.push({key:  "q" + stateRecorder.get(key).toString() + "{"+newKey+"}", values: stateResult});
            }
            // newConvertorTab.push({key:  "q" + stateRecorder.get(key).toString() + "{"+key+"}", values: stateResult});
            stateResult = [];
            newKey = "";
        }

        //convert key 99 to Ø and values "" to Ø
        for(let i = 0; i < newConvertorTab.length; i++){
            if(newConvertorTab[i].key === "q99{}"){
                newConvertorTab[i].key = "Ø";
            }
            for(let j = 0; j < newConvertorTab[i].values.length; j++){
                if(newConvertorTab[i].values[j] === "{}"){
                    newConvertorTab[i].values[j] = "Ø";
                }
            }
        }

        console.log("New Convertor Tab: ", newConvertorTab);
        return newConvertorTab;
    }


    static convertToDFA = (nfaAutomaton : FiniteStateAutomaton)  => {
        console.log("Tady je nfaAutomaton: ", nfaAutomaton);

        let newTransitions : TransitionMeta[] = [];
        const stateRecorder: Map<string, number> = new Map<string, number>();
        let newStates : GraphNodeMeta[] = [];
        let currentStatesId : number[];
        let alphabet = nfaAutomaton.input_alphabet;

        let finishStates : number[] = [];
        if (typeof nfaAutomaton.finishState === "string") {
            finishStates.push(parseInt(nfaAutomaton.finishState));
        } else if (Array.isArray(nfaAutomaton.finishState)) {
            finishStates = nfaAutomaton.finishState.map(state => parseInt(state));
        } else if (typeof nfaAutomaton.finishState === "number") {
            finishStates.push(nfaAutomaton.finishState);
        }

        if (typeof nfaAutomaton.startState === "string") {
            currentStatesId = [parseInt(nfaAutomaton.startState)];
        } else {
            currentStatesId = nfaAutomaton.startState.map(state => parseInt(state));
        }

        //if alphabet has epsilon, remove it
        if (alphabet.includes("ε")) {
            alphabet = alphabet.filter(item => item !== "ε");
        }

        // console.log("Start States: " + nfaAutomaton.startState)
        // console.log("Start States: " + typeof nfaAutomaton.startState)

        // for (let state of nfaAutomaton.startState) {
        //     currentStatesId.push(parseInt(state));
        // }
        console.log("Start States: " + currentStatesId)

        let stateCounter = 0;

        for (let i: number = 0; i <= stateCounter; i++) {

            if(i == stateCounter && i != 0) {
                break;
            }
            if (i != 0){
                for (const [key, value] of stateRecorder) {
                    if (value === i + 1) {
                        let newKey = key;

                        currentStatesId.splice(0, currentStatesId.length);

                        let arrayOfIds = newKey.split(",");

                        for (const id of arrayOfIds) {
                            currentStatesId.push(parseInt(id));
                        }

                        break;
                    }
                }
            }

            console.log("Current States before expand: " + currentStatesId)
            ConvertorToDFA.expendCurrentStates(currentStatesId, nfaAutomaton);
            console.log("Current States after expand: " + currentStatesId)
            let key = ConvertorToDFA.buildStateKey(currentStatesId);

            if (i == 0){
                let nodeClass = "start";
                //check if nfaAuitomaton finish states are in the current states
                for (let id of currentStatesId) {
                    if (finishStates.includes(parseInt(id))) {
                        nodeClass = "finish start";
                    }
                }

                stateCounter++;
                let value = stateCounter;
                console.log("Key: " + key + " Value: " + value);
                stateRecorder.set(key, value);
                console.log("StateRecorder: " + stateRecorder.get(key));
                newStates.push({id: stateRecorder.get(key).toString(), label: "q" + stateRecorder.get(key).toString(), class: nodeClass});
            }

            const allEndStatesIds: Set<number> = new Set<number>();

            for(let c of alphabet) {
                for (let id of currentStatesId) {
                    if (!nfaAutomaton.transitions.some(transition => transition.state == id.toString())) {
                        continue;
                    }
                    let endStates: number[] = nfaAutomaton.transitions.filter(transition => transition.input === c && transition.state == id.toString()).map(transition => Number(transition.stateAfter));
                    if (endStates.length === 0) {
                        continue;
                    }

                    this.expendCurrentStates(endStates, nfaAutomaton);

                    for (let endState of endStates) {
                        allEndStatesIds.add(endState);
                    }
                }
                let allEndStatesIdsArray = Array.from(allEndStatesIds);
                let valueState = ConvertorToDFA.buildStateKey(allEndStatesIdsArray);

                if (valueState === "") {
                    valueState = "99";
                }

                if(!stateRecorder.has(valueState)) {
                   if(valueState != "99"){
                      let arratyOfIds = valueState.split(",");
                      let finish = false;
                      for(let id of arratyOfIds){
                          if(finishStates.includes(parseInt(id))){
                              finish = true;
                              break;
                          }
                      }
                      stateCounter++;
                      stateRecorder.set(valueState, stateCounter);
                      newStates.push({id: stateRecorder.get(valueState).toString(), label: "q" + stateRecorder.get(valueState).toString(), class: finish ? "finish" : ""});
                   } else {
                       stateRecorder.set(valueState, 99);

                       newStates.push({id: "99", label: "Ø"});
                   }
                }

                allEndStatesIds.clear();
                let newStateAfterLabel = "q" + stateRecorder.get(valueState).toString();
                if (stateRecorder.get(valueState) == 99){
                    newStateAfterLabel = "Ø";
                }

                newTransitions.push({
                    state: stateRecorder.get(key).toString(),
                    stateLabel: "q" + stateRecorder.get(key).toString(),
                    input: c,
                    stack: "",
                    stackAfter: "",
                    stateAfter: stateRecorder.get(valueState).toString(),
                    stateAfterLabel: newStateAfterLabel
                });

            }

        }

        if(stateRecorder.has("99")){
            for(let c of alphabet){
                newTransitions.push({
                    state: "99",
                    stateLabel: "Ø",
                    input: c,
                    stack: "",
                    stackAfter: "",
                    stateAfter: "99",
                    stateAfterLabel: "Ø"
                });
            }
        }

        let startNodeIds: string[] = newStates
            .filter(node => node.class === "start" || node.class === "finish start")
            .map(node => node.id);

        let endNodeIds: string[] = newStates
            .filter(node => node.class === "finish" || node.class === "finish start")
            .map(node => node.id);

        return {newFa: new FiniteStateAutomaton(newStates, newTransitions, startNodeIds, endNodeIds, "DFA"), stateRecorder: stateRecorder};
        // return new FiniteStateAutomaton(newStates, newTransitions, startNodeIds, endNodeIds, "DFA");
    }

    private static expendCurrentStates(currentStatesId: number[], nfaAutomaton: FiniteStateAutomaton) {
        let newCurrentStatesId : number[] = currentStatesId.slice();

        while (this.haseEpsilonTransition(newCurrentStatesId, nfaAutomaton)) {
            newCurrentStatesId = this.addStateToCurrentStates(newCurrentStatesId, currentStatesId, nfaAutomaton);
        }

        // nfaAutomaton.transitions.forEach(transition => {
        //     if (currentStatesId.includes(Number(transition.state))) {
        //         if (transition.input === "ε") {
        //             newCurrentStatesId = this.addStateToCurrentStates(newCurrentStatesId, currentStatesId, nfaAutomaton);
        //         }
        //     }
        // });
    }

    private static haseEpsilonTransition(newCurrentStates: number[], nfaAutomaton: FiniteStateAutomaton) : boolean {
        for (let id of newCurrentStates) {
            if (nfaAutomaton.transitions.some(transition => transition.input === "ε" && transition.state === id.toString())) {
                return true;
            }
        }
        return false;
    }

    private static addStateToCurrentStates(lastAdded: number[], currentStatesId: number[], nfaAutomaton: FiniteStateAutomaton) : number[] {

        let newCurrentStatesId : number[] =[];
        let epsilons : TransitionMeta[] = [];

        for(let id of lastAdded) {
            nfaAutomaton.transitions.forEach(transition => {
                if (transition.input === "ε" && transition.state == id.toString()) {
                    epsilons.push(transition);
                }

            });

            if (epsilons.length === 0) {
                continue;
            }

            for(let stateAfter of epsilons) {
                if (!currentStatesId.includes(Number(stateAfter.stateAfter))) {
                    newCurrentStatesId.push(Number(stateAfter.stateAfter));
                    currentStatesId.push(Number(stateAfter.stateAfter));
                }
            }
        }

        return newCurrentStatesId;
    }

    private static buildStateKey(listOfIds: number[]) : string {
        listOfIds.sort((a, b) => a - b);
        let key = "";

        for(let id = 0; id < listOfIds.length; id++) {
            if (id == 0){
                key += listOfIds[id];
            } else{
                key += ","+ listOfIds[id];
            }
        }

        // for(let id of listOfIds) {
        //     if (id == 0){
        //         key += id;
        //     } else{
        //         key += ","+ id;
        //     }
        // }

        return key;
    }



}