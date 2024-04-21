<script lang="ts">

    import {first_graph_store, resetInputVar} from "../../../stores/graphInitStore";
    import type {TransitionMeta} from "../../../types/TransitionMeta";
    import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";
    import {input_error_store} from "../../../stores/inputErrorStore";

    let transitions : TransitionMeta[] = [];
    let alphabet : string[] = [];
    let textInput : string = "";
    let textarea: HTMLTextAreaElement;
    let backdrop: HTMLDivElement;
    let correctInput: boolean = true;

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
        if (rowSplit[0] == "") {
            rowSplit.splice(0, 1);
        }
        rowSplit.splice(0, 1);

        if (rowSplit.length === 3) {
            let stateId = transitions.find(transition => transition.stateLabel === rowSplit[0])?.state;
            if (stateId == undefined) {
                stateId = transitions.find(transition => transition.stateAfterLabel === rowSplit[0])?.stateAfter;
            }

            let stateAfterId = transitions.find(transition => transition.stateLabel === rowSplit[2])?.state;
            if (stateAfterId == undefined) {
                stateAfterId = transitions.find(transition => transition.stateAfterLabel === rowSplit[2])?.stateAfter;
            }

            if (stateId >= 0) {
                if (stateAfterId >= 0) {
                    transitions.push({
                        state: stateId,
                        stateLabel: rowSplit[0],
                        input: rowSplit[1],
                        stateAfter: stateAfterId,
                        stateAfterLabel: rowSplit[2],
                    });
                } else {
                    transitions.push({
                        state: stateId,
                        stateLabel: rowSplit[0],
                        input: rowSplit[1],
                        stateAfter: $first_graph_store.followingID,
                        stateAfterLabel: rowSplit[2],
                    });
                    $first_graph_store.followingID++;
                }
            } else {
                if(stateAfterId >= 0) {
                    transitions.push({
                        state: $first_graph_store.followingID,
                        stateLabel: rowSplit[0],
                        input: rowSplit[1],
                        stateAfter: stateAfterId,
                        stateAfterLabel: rowSplit[2],
                    });
                    $first_graph_store.followingID++;
                } else {
                    if (rowSplit[0] == rowSplit[2]) {
                        transitions.push({
                            state: $first_graph_store.followingID,
                            stateLabel: rowSplit[0],
                            input: rowSplit[1],
                            stateAfter: $first_graph_store.followingID,
                            stateAfterLabel: rowSplit[2],
                        });
                        $first_graph_store.followingID++;
                    } else {
                        transitions.push({
                            state: $first_graph_store.followingID,
                            stateLabel: rowSplit[0],
                            input: rowSplit[1],
                            stateAfter: $first_graph_store.followingID + 1,
                            stateAfterLabel: rowSplit[2],
                        });
                        $first_graph_store.followingID += 2;
                    }
                }
            }

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
                    label: transition.stateLabel,
                });
            }
        }
        for (let transition of transitions) {
            if (!nodes.find(node => node.id === transition.stateAfter)) {
                nodes.push({
                    id: transition.stateAfter,
                    label: transition.stateAfterLabel,
                });
            }
        }

        first_graph_store.update((n) => {
            n.nodes = nodes;
            return n;
        });
        console.log("Nodes: ", nodes);
    }

    function processTransitions() {
        transitions = [];
        console.log("Here start transitions: ", transitions);

        let rows = textInput.split("\n").filter(Boolean);

        if ($first_graph_store.type == "DFA") {
            applyHighlightsDFA(textInput);

            for (let row of rows) {
                if (validateTransitionDFA(row)) {
                    parseRow(row);
                    correctInput = true;
                } else {
                    correctInput = false;
                }
            }
        } else if ($first_graph_store.type == "NFA") {
            applyHighlights(textInput);

            for (let row of rows) {
                if (validateTransition(row)) {
                    parseRow(row);
                    correctInput = true;
                } else {
                    correctInput = false;
                }
            }

        } else {
            console.log("Invalid type");
        }


        console.log("Is input correct: ", correctInput);

        input_error_store.update((n) => {
            n.transitions = correctInput;
            return n;
        });

        first_graph_store.update((n) => {
            n.transitions = transitions;
            n.input_alphabet = alphabet;
            return n;
        });


        storeNodes();
    }

    function validateTransition(transition) {
        let regex = /d\(([A-Za-z0-9]|[A-Za-z][0-9]),(ε|[A-Za-z0-9])\)=([A-Za-z0-9]|[A-Za-z][0-9]);$/;
        return regex.test(transition);
    }

    function validateTransitionDFA(transition) {
        let regex = /^d\(([A-Za-z0-9]|[A-Za-z][0-9]),[^ε]\)=([A-Za-z0-9]|[A-Za-z][0-9]);$/;
        return regex.test(transition);
    }

    function applyHighlightsDFA(text) {
        return text
            .replace(/\n$/g, '\n\n')
            .replace(/(d\(([A-Za-z0-9]|[A-Za-z][0-9]),[^ε]\)=([A-Za-z0-9]|[A-Za-z][0-9]);)|(.*)/g, function(match, validTransition, other) {
                if (validTransition) {
                    return match;  // If it's a valid transition, leave it unchanged
                } else {
                    return '<mark>' + match + '</mark>';  // If it's not a valid transition, wrap it in <mark> tags
                }
            });
    }

    function applyHighlights(text) {
        if ($first_graph_store.type == "DFA") {
            return text
                .replace(/\n$/g, '\n\n')
                .replace(/(d\(([A-Za-z0-9]|[A-Za-z][0-9]),([A-Za-z0-9])\)=([A-Za-z0-9]|[A-Za-z][0-9]);)|(.*)/g, function (match, validTransition, other) {
                    if (validTransition) {
                        return match;  // If it's a valid transition, leave it unchanged
                    } else {
                        return '<mark>' + match + '</mark>';  // If it's not a valid transition, wrap it in <mark> tags
                    }
                });
        } else if ($first_graph_store.type == "NFA") {
            return text
                .replace(/\n$/g, '\n\n')
                .replace(/(d\(([A-Za-z0-9]|[A-Za-z][0-9]),(ε|[A-Za-z0-9])\)=([A-Za-z0-9]|[A-Za-z][0-9]);)|(.*)/g, function (match, validTransition, other) {
                    if (validTransition) {
                        return match;  // If it's a valid transition, leave it unchanged
                    } else {
                        return '<mark>' + match + '</mark>';  // If it's not a valid transition, wrap it in <mark> tags
                    }
                });
        }
    }

    function handleScroll() {
        let scrollTop = textarea.scrollTop;
        backdrop.scrollTop = scrollTop;
    }


</script>

<div class="container">
    <div class="backdrop" bind:this={backdrop} >
        <div class="highlights">
            {@html applyHighlights(textInput)}
        </div>
    </div>
    <textarea id="function-input"
              bind:value={textInput}
              bind:this={textarea}
              on:input={processTransitions}
              on:scroll={handleScroll}
              class="function-input"
              rows="20"
              placeholder={`d(q0,0)=q0;`} />
</div>
<style>
    .function-input {
        border-radius: 0.3rem;
        border: 0.1rem solid #c5c5c5;
        height: 15rem;
        width: 10.5rem;

        letter-spacing: 1px;
        display: block;
        position: absolute;
        z-index: 2;
        margin: 0;
        /*border: 2px solid #74637f;*/
        color: #444;
        background-color: transparent;
        overflow: auto;
        resize: none;
        transition: transform 1s;
    }
    textarea {
        margin: 0;
        border-radius: 0;
    }


    .highlights{
        letter-spacing: 1px;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: transparent;
        margin: 0 auto;
    }

    .highlights, textarea {
        padding: 0.05rem;
        font: 1rem/1.5rem 'Open Sans', sans-serif;
        letter-spacing: 1px;
    }

    .backdrop {
        position: absolute;
        z-index: 1;
        /*border: 2px solid #685972;*/
        background-color: #fff;
        overflow: auto;
        pointer-events: none;
        transition: transform 1s;
        height: 100%;
        width: 100%;
        margin: auto;
        border: 0.1rem solid transparent;
    }

    .container{
        display: block;
        margin: 0 auto;
        border: 0.1rem solid transparent;
        transform: translateZ(0);
        padding: 0.05rem;
        height: 15rem;;
        width: 10.5rem;
    }


    .backdrop {
        background-color: #fff; /* or whatever */
    }

    :global(mark) {
        color: transparent;
        border-radius: 0.2rem;
        background-color: #f36969; /* or whatever */
    }

    :global(body.dark-mode) .function-input {
        border: 0.1rem solid #9c81da;

        /*background-color: #2f3941;*/
        background-color: transparent;
        color: #f4f9ff;
    }

    :global(body.dark-mode) .backdrop {
        background-color: #2f3941;
    }

</style>