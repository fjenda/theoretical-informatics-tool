<script lang="ts">
    import {pda_backup_store, pda_graph_store, resetInputVar} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import type {TransitionType} from "../../types/pda-cfg/TransitionType";

    let transitions: TransitionType[] = [];
    let textInput: string = "";
    let textArea: HTMLTextAreaElement;
    let backdrop: HTMLDivElement;
// Test input
// d(q0,a,Z)=(q0,A Z);
// d(q0,a,A)=(q0,A A);
// d(q0,b,A)=(q1,ε);
// d(q1,b,A)=(q1,ε);
// d(q1,ε,Z)=(q1,ε);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// d(q0,a,Z)=(q0,a Z);
// d(q0,c,a)=(q1,a);
// d(q0,c,b)=(q1,b);
// d(q0,b,Z)=(q0,b Z);
// d(q0,c,Z)=(q1,ε);
// d(q0,a,a)=(q0,a a);
// d(q0,a,b)=(q0,a b);
// d(q1,a,a)=(q1,ε);
// d(q1,b,b)=(q1,ε);
// d(q0,b,a)=(q0,b a);
// d(q0,b,b)=(q0,b b);
// d(q1,ε,Z)=(q1,ε);
// abcba - patri
// abca - nepatri
// ----------------
// d(q0,a,Z)=(q0,x x Z);
// d(q0,a,x)=(q0,x x x);
// d(q0,b,x)=(q1,ε);
// d(q1,b,x)=(q1,ε);
// d(q1,ε,Z)=(qf,ε);
// aabbbb - patri
// ab - nepatri
// ----------------
// d(q0,a,Z)=(q1,A Z);
// d(q1,a,A)=(q1,A A);
// d(q1,b,A)=(q2,ε);
// d(q2,b,A)=(q2,ε);
// d(q2,ε,Z)=(q3,Z);
// d(q3,b,Z)=(q3,Z);
// d(q3,ε,Z)=(q4,Z);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// d(q0,a,Z)=(q1,Z);
// d(q0,a,Z)=(q2,Z);
// d(q1,b,Z)=(q1,Z);
// d(q2,c,Z)=(q2,Z);
// d(q1,ε,Z)=(q3,Z);
// d(q2,ε,Z)=(q3,Z);
// d(q3,ε,Z)=(q3,ε);
// ab, ac - patri
// aa - nepatri
// ----------------
// d(q0,a,Z)=(q1,Z);
// d(q0,a,Z)=(q2,Z);
// d(q1,b,Z)=(q1,Z);
// d(q2,b,Z)=(q2,Z);
// d(q1,ε,Z)=(q3,Z);
// d(q2,ε,Z)=(q4,Z);
// d(q3,a,Z)=(q4,Z);
// d(q4,ε,Z)=(q4,ε);
// aa, aba, abba - patri
// aab - nepatri
// ----------------
// Context-free grammar
// d(q,ε,Z)=(q,a b Z b a);
// d(q,ε,Z)=(q,A);
// d(q,ε,A)=(q,c A c);
// d(q,ε,A)=(q,a B);
// d(q,ε,B)=(q,a B);
// d(q,ε,B)=(q,ε);
// d(q,a,a)=(q,ε);
// d(q,b,b)=(q,ε);
// d(q,c,c)=(q,ε);
// d(q,ε,Z)=(q,ε);
// abaaba - patri
// ----------------

    $: if ($resetInputVar) {
        textInput = "";
    }

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

        if (rowSplit.length === 5) {
            transitions.push({
                state: rowSplit[0],
                input: rowSplit[1],
                stack: rowSplit[2],
                stateAfter: rowSplit[3],
                stackAfter: rowSplit[4].split(" "),
            });
        }
    }

    function storeNodes() {
        //get nodes from transitions
        let nodes: GraphNodeMeta[] = [];
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

        pda_backup_store.update((n) => {
            n.nodes = nodes;
            return n;
        });
    }

    function processTransitions() {
        transitions = [];
        let rows = textInput.split("\n").filter(Boolean);

        applyHighlights(textInput);

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
        storeNodes();
    }

    function validateTransition(transition) {
        return /d\([A-Za-z]+[0-9]*,[A-Za-z-ε],[A-Za-z]+'*\)=\([A-Za-z]+[A-Za-z0-9]*,(?:(?:(?:[a-z]|[A-Z]'?) )*(?:[a-z]|[A-Z]'?)|ε)\);/.test(transition);
    }

    function applyHighlights(text: string) {
        return text
            .replace(/\n$/g, '\n\n')
            .replace(/(d\([A-Za-z]+[0-9]*,[A-Za-z-ε],[A-Za-z]+'*\)=\([A-Za-z]+[A-Za-z0-9]*,(?:(?:(?:[a-z]|[A-Z]'?) )*(?:[a-z]|[A-Z]'?)|ε)\);)|(.*)/g, function (match, pattern, other) {
                if (pattern) {
                    return match;
                } else {
                    return "<mark>" + match + "</mark>";
                }
            });
    }

    function handleScroll() {
        backdrop.scrollTop = textArea.scrollTop;
    }

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
              placeholder={'d(q0,a,Z)=(q1,A Z);'}
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