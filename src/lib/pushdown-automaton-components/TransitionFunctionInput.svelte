<script lang="ts">
    import { graph_store, resetInputVar } from "../../stores/graphInitStore";

    let transitions : TransitionMeta[] = [];
    let textInput : string = "";
    let highlightedRow = null;
// Test input
// (q0,a,Z)=(q0,AZ);
// (q0,a,A)=(q0,AA);
// (q0,b,A)=(q1,E);
// (q1,b,A)=(q1,E);
// (q1,E,Z)=(q1,E);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// (q0,a,Z)=(q0,aZ);
// (q0,c,a)=(q1,a);
// (q0,c,b)=(q1,b);
// (q0,b,Z)=(q0,bZ);
// (q0,c,Z)=(q1,E);
// (q0,a,a)=(q0,aa);
// (q0,a,b)=(q0,ab);
// (q1,a,a)=(q1,E);
// (q1,b,b)=(q1,E);
// (q0,b,a)=(q0,ba);
// (q0,b,b)=(q0,bb);
// (q1,E,Z)=(q1,E);
// abcba - patri
// abca - nepatri
// ----------------
// (q0,a,Z)=(q0,xxZ);
// (q0,a,x)=(q0,xxx);
// (q0,b,x)=(q1,E);
// (q1,b,x)=(q1,E);
// (q1,E,Z)=(qf,E);
// aabbbb - patri
// ab - nepatri
// ----------------
// (q0,a,Z)=(q1,AZ);
// (q1,a,A)=(q1,AA);
// (q1,b,A)=(q2,E);
// (q2,b,A)=(q2,E);
// (q2,E,Z)=(q3,Z);
// (q3,b,Z)=(q3,Z);
// (q3,E,Z)=(q4,Z);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// (q0,a,Z)=(q1,Z);
// (q0,a,Z)=(q2,Z);
// (q1,b,Z)=(q1,Z);
// (q2,c,Z)=(q2,Z);
// (q1,E,Z)=(q3,Z);
// (q2,E,Z)=(q3,Z);
// ab, ac - patri
// aa - nepatri
// ----------------
// (q0,a,Z)=(q1,Z);
// (q0,a,Z)=(q2,Z);
// (q1,b,Z)=(q1,Z);
// (q2,b,Z)=(q2,Z);
// (q1,E,Z)=(q3,Z);
// (q2,E,Z)=(q4,Z);
// (q3,a,Z)=(q4,Z);
// aa, aba, abba - patri
// aab - nepatri
// ----------------
// Context-free grammar (Not implemented yet)
// (q,E,S)=(q,abSba);
// (q,E,S)=(q,A);
// (q,E,A)=(q,cAc);
// (q,E,A)=(q,aB);
// (q,E,B)=(q,aB);
// (q,E,B)=(q,E);
// (q,a,a)=(q,E);
// (q,b,b)=(q,E);
// (q,c,c)=(q,E);
// (q,E,Z)=(q,E);
// abaaba - patri
// ----------------

    $: if ($resetInputVar) {
        textInput = "";
    }

    function parseRow(row : string) {
        let rowSplit = row.split(/[=,\n)(]/);
        for (let i = rowSplit.length - 1; i > 0; i--) {
            if (!rowSplit[i]?.trim()) {
                rowSplit.splice(i, 1);
            }
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
        let rows = textInput.split(";");

        for (let row of rows) {
            if (!validateTransition(row)) {
                parseRow(row);
            }
        }

        graph_store.update((n) => {
            n.transitions = transitions;
            return n;
        });
        storeNodes();
    }

    function validateTransition(transition) {
        return /\([A-Za-z]+[0-9]+,[A-Za-z],[A-Za-z]\)=\([A-Za-z]+[0-9]+,[A-Za-z]+\);/.test(transition);
    }

    function highlightRow(rowNumber) {
        highlightedRow = rowNumber;
    }

</script>

<textarea id="function-input"
          bind:value={textInput}
          on:input={processTransitions}
          class="function-input"
          rows="20"
          placeholder={`d(q0,a,Z)=(q1,AZ);`} />

<style>
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