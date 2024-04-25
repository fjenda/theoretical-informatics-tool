<script lang="ts">
    import {pda_backup_store, resetInputVar} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import type {TransitionType} from "../../types/pda-cfg/TransitionType";

    let transitions: TransitionType[] = [];
    let textInput: string = "";
    let textArea: HTMLTextAreaElement;
    let backdrop: HTMLDivElement;

    // Reactive statement to reset the input text
    $: if ($resetInputVar) {
        textInput = "";
    }

    // Function that parses the input text and stores the transitions
    // params: row: string - the row to be parsed
    function parseRow(row: string) {
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

        // store the transition
        if (rowSplit.length === 5) {
            transitions.push({
                state: rowSplit[0],
                input: rowSplit[1],
                stack: rowSplit[2],
                stateAfter: rowSplit[3],
                stackAfter: rowSplit[4].split(""),
            });
        }
    }

    // Function that extracts the nodes from transitions and stores them
    function storeNodes() {
        //get nodes from transitions
        let nodes: GraphNodeMeta[] = [];
        for (let transition of transitions) {
            // if the node is not already in the list, add it
            if (!nodes.find(node => node.id === transition.state)) {
                nodes.push({
                    id: transition.state,
                    label: transition.state,
                });
            }
            // if the node is not already in the list, add it
            if (!nodes.find(node => node.id === transition.stateAfter)) {
                nodes.push({
                    id: transition.stateAfter,
                    label: transition.stateAfter,
                });
            }
        }

        // store the nodes
        pda_backup_store.update((n) => {
            n.nodes = nodes;
            return n;
        });
    }

    // Function that processes the text input into transitions
    function processTransitions() {
        transitions = [];
        let rows = textInput.split("\n").filter(Boolean);

        // apply highlights to the text
        applyHighlights(textInput);

        // validate each row and parse it
        let allTrue: boolean = true;
        for (let row of rows) {
            // console.log(row);
            if (validateTransition(row)) {
                parseRow(row);
            } else {
                allTrue = false;
            }
        }

        // remove duplicate transitions
        transitions = transitions.filter((transition, index, self) =>
            index === self.findIndex((t) => (
                transitionEquals(t, transition)
            ))
        );

        input_error_store.update((n) => {
            n.transitions = allTrue;
            return n;
        });

        pda_backup_store.update((n) => {
            n.transitions = transitions;
            return n;
        });

        // store the nodes
        storeNodes();
    }

    // Function that validates a transition using regex
    function validateTransition(transition) {
        return /d\([A-Za-z]+[0-9]*,[A-Za-z0-9-ε],[A-Za-z0-9]+'*\)=\([A-Za-z]+[A-Za-z0-9]*,(?:(?:[0-9]|(?:[a-z]|[A-Z]'?))*(?:[0-9]|(?:[a-z]|[A-Z]'?))|ε)\);/.test(transition);
    }

    // Function that applies highlights to the text using regex
    function applyHighlights(text: string) {
        return text
            .replace(/\n$/g, '\n\n')
            .replace(/(d\([A-Za-z]+[0-9]*,[A-Za-z0-9-ε],[A-Za-z0-9]+'*\)=\([A-Za-z]+[A-Za-z0-9]*,(?:(?:[0-9]|(?:[a-z]|[A-Z]'?))*(?:[0-9]|(?:[a-z]|[A-Z]'?))|ε)\);)|(.*)/g, function (match, pattern, other) {
                if (pattern) {
                    return match;
                } else {
                    return "<mark>" + match + "</mark>";
                }
            });
    }

    // Function that handles the scroll of the text area for the highlights
    function handleScroll() {
        backdrop.scrollTop = textArea.scrollTop;
    }

    // Function that compares two transitions
    // params: t1: TransitionType - the first transition
    //         t2: TransitionType - the second transition
    //
    // returns: boolean - true if the transitions are equal, false otherwise
    function transitionEquals(t1: TransitionType, t2: TransitionType) {
        return t1.state === t2.state &&
            t1.input === t2.input &&
            t1.stack === t2.stack &&
            t1.stateAfter === t2.stateAfter &&
            t1.stackAfter === t2.stackAfter;
    }

</script>

<div class="container">
    <div class="backdrop" bind:this={backdrop}>
        <div class="highlights">
            {@html applyHighlights(textInput)}
        </div>
    </div>
    <textarea bind:value={textInput}
              bind:this={textArea}
              on:scroll={handleScroll}
              on:input={processTransitions}
              id="function-input"
              class="function-input"
              placeholder={'d(q0,a,Z)=(q1,AZ);'}
              rows="20"/>
</div>

<style>
    textarea {
        margin: 0;
        border-radius: 0;
    }

    .function-input {
        border-radius: 0.3rem;
        border: 0.1rem solid #ccc;
        background-color: transparent;
        color: #393939;

        height: 15rem;
        width: 10.5rem;

        resize: none;

        display: block;
        position: absolute;
        z-index: 2;
        margin: 0;
        overflow: auto;
        font: 1rem/1.5rem 'Open Sans', sans-serif;
    }

    :global(body.dark-mode) .function-input {
        border: 0.1rem solid #9c81da;
        /*background-color: #2f3941;*/
        color: #f4f9ff;
    }

    .highlights {
        white-space: pre-wrap;
        word-wrap: break-word;

        /*color: orange;*/
        color: transparent;

        margin: 0 auto;
        border: 0.1rem solid transparent;
        font: 1rem/1.5rem 'Open Sans', sans-serif;
    }

    .backdrop {
        padding: 0.05rem;
        position: absolute;
        z-index: 1;
        background-color: #eee;
        overflow: auto;
        pointer-events: none;
        height: 15rem;
        width: 10.5rem;
        margin: auto;
        border: 0.1rem solid transparent;
    }

    :global(body.dark-mode) .backdrop {
        background-color: #2f3941;
    }

    .container {
        display: block;
        margin: 0 auto;
        padding: 0.05rem;
        height: 15rem;
        width: 10.5rem;
    }

    :global(mark) {
        color: transparent;
        border-radius: 0.2rem;
        background-color: #ff6969;
    }
</style>