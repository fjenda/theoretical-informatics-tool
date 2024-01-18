<script lang="ts">
    import { graph_store, resetInputVar } from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";

    let transitions : TransitionMeta[] = [];
    let textInput : string = "";
// Test input
// d(q0,a,Z)=(q0,AZ);
// d(q0,a,A)=(q0,AA);
// d(q0,b,A)=(q1,E);
// d(q1,b,A)=(q1,E);
// d(q1,E,Z)=(q1,E);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// d(q0,a,Z)=(q0,aZ);
// d(q0,c,a)=(q1,a);
// d(q0,c,b)=(q1,b);
// d(q0,b,Z)=(q0,bZ);
// d(q0,c,Z)=(q1,E);
// d(q0,a,a)=(q0,aa);
// d(q0,a,b)=(q0,ab);
// d(q1,a,a)=(q1,E);
// d(q1,b,b)=(q1,E);
// d(q0,b,a)=(q0,ba);
// d(q0,b,b)=(q0,bb);
// d(q1,E,Z)=(q1,E);
// abcba - patri
// abca - nepatri
// ----------------
// d(q0,a,Z)=(q0,xxZ);
// d(q0,a,x)=(q0,xxx);
// d(q0,b,x)=(q1,E);
// d(q1,b,x)=(q1,E);
// d(q1,E,Z)=(qf,E);
// aabbbb - patri
// ab - nepatri
// ----------------
// d(q0,a,Z)=(q1,AZ);
// d(q1,a,A)=(q1,AA);
// d(q1,b,A)=(q2,E);
// d(q2,b,A)=(q2,E);
// d(q2,E,Z)=(q3,Z);
// d(q3,b,Z)=(q3,Z);
// d(q3,E,Z)=(q4,Z);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// d(q0,a,Z)=(q1,Z);
// d(q0,a,Z)=(q2,Z);
// d(q1,b,Z)=(q1,Z);
// d(q2,c,Z)=(q2,Z);
// d(q1,E,Z)=(q3,Z);
// d(q2,E,Z)=(q3,Z);
// d(q3,E,Z)=(q3,E);
// ab, ac - patri
// aa - nepatri
// ----------------
// d(q0,a,Z)=(q1,Z);
// d(q0,a,Z)=(q2,Z);
// d(q1,b,Z)=(q1,Z);
// d(q2,b,Z)=(q2,Z);
// d(q1,E,Z)=(q3,Z);
// d(q2,E,Z)=(q4,Z);
// d(q3,a,Z)=(q4,Z);
// d(q4,E,Z)=(q4,E);
// aa, aba, abba - patri
// aab - nepatri
// ----------------
// Context-free grammar (Not implemented yet)
// d(q,E,S)=(q,abSba);
// d(q,E,S)=(q,A);
// d(q,E,A)=(q,cAc);
// d(q,E,A)=(q,aB);
// d(q,E,B)=(q,aB);
// d(q,E,B)=(q,E);
// d(q,a,a)=(q,E);
// d(q,b,b)=(q,E);
// d(q,c,c)=(q,E);
// d(q,E,Z)=(q,E);
// abaaba - patri
// ----------------

    $: if ($resetInputVar) {
        textInput = "";
    }

    function parseRow(row : string) {
        let rowSplit = row.split(/[=,\n)(;]/);
        for (let i = rowSplit.length - 1; i > 0; i--) {
            if (!rowSplit[i]?.trim()) {
                rowSplit.splice(i, 1);
            }
        }

        //remove empty string at the beginning and the d
        if (rowSplit[0] === "") {
            rowSplit.splice(0, 1);
        }
        rowSplit.splice(0, 1);

        if (rowSplit.length === 5) {
            transitions.push({
                state: rowSplit[0],
                input: rowSplit[1],
                stack: rowSplit[2],
                stateAfter: rowSplit[3],
                stackAfter: rowSplit[4],
            });
        }
    }

    function storeNodes() {
        //get nodes from transitions
        let nodes : GraphNodeMeta[] = [];
        for (let transition of transitions) {
            if (!nodes.find(node => node.id === transition.state)) {
                nodes.push({
                    id: transition.state,
                    label: transition.state,
                });
            }
            if (!nodes.find(node => node.id === transition.stateAfter)) {
                nodes.push({
                    id: transition.stateAfter,
                    label: transition.stateAfter,
                });
            }
        }

        graph_store.update((n) => {
            n.nodes = nodes;
            return n;
        });
    }

    function processTransitions() {
        transitions = [];
        let rows = textInput.split("\n").filter(Boolean);

        let allTrue : boolean = true;
        for (let row of rows) {
            console.log(row);
            if (validateTransition(row)) {
                parseRow(row);
            } else {
                allTrue = false;
            }
        }

        input_error_store.update((n) => {
            n.transitions = allTrue;
            return n;
        });

        graph_store.update((n) => {
            n.transitions = transitions;
            return n;
        });
        storeNodes();
    }

    function validateTransition(transition) {
        return /d\([A-Za-z]+[0-9]+,[A-Za-z],[A-Za-z]\)=\([A-Za-z]+[A-Za-z0-9]+,[A-Za-z]+\);/.test(transition);
    }

</script>

<textarea id="function-input"
          bind:value={textInput}
          on:input={processTransitions}
          class="function-input {$input_error_store.transitions}"
          rows="20"
          placeholder={`d(q0,a,Z)=(q1,AZ);`} />

<style>
    .false {
        transition: background-color 0.25s;
        background-color: #ff0000;
    }

    .function-input {
        /*border-radius: 1rem;*/
        border-radius: 0.3rem;
        border: 0.1rem solid #c5c5c5;

        resize: none;
        height: 15rem;
        width: 10.5rem;
    }

    .highlight {
        background-color: red;
    }
</style>