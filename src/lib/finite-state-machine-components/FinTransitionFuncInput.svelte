<!--d(q0,0)=q0;-->
<!--d(q0,1)=q1;-->
<!--d(q1,0)=q1;-->
<!--d(q1,0)=q2;-->
<!--d(q1,1)=q1;-->
<!--d(q2,0)=q2;-->
<!--d(q2,1)=q1;-->
<!--d(q2,1)=q2;-->
<!--//-->
<!--//-->
<!--d(q0,0)=q0;-->
<!--d(q0,0)=q1;-->
<!--d(q0,1)=q1;-->
<!--d(q1,1)=q0;-->
<!--d(q1,1)=q1;-->

<script lang="ts">

    import {graph_store, resetInputVar} from "../stores/graphInitStore";

    let transitions : TransitionMeta[] = [];
    let alphabet : string[] = [];
    let textInput : string = "";
    let highlightedRow = null;


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
        if (rowSplit[0] == "") {
            rowSplit.splice(0, 1);
        }
        rowSplit.splice(0, 1);

        if (rowSplit.length === 3) {
            transitions.push({
                state: rowSplit[0],
                input: rowSplit[1],
                stateAfter: rowSplit[2],
            });
            alphabet.push(rowSplit[1]);
        }

        alphabet = alphabet.filter((item, index) => alphabet.indexOf(item) === index);

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
            if (validateTransition(row)) {
                parseRow(row);
            }
        }


        graph_store.update((n) => {
            n.transitions = transitions;
            n.input_alphabet = alphabet;
            return n;
        });


        storeNodes();
    }

    function validateTransition(transition) {
        console.log(transition);
        let regex = /d\([A-Za-z]+[0-9]+,[A-Za-z0-9]\)=[A-Za-z]+[0-9]/;
        return regex.test(transition);
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