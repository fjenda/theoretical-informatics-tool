<!--DFA-->
<!--d(q0,a)=q0;-->
<!--d(q0,b)=q1;-->
<!--d(q1,b)=q0;-->
<!--//-->
<!--//-->
<!--d(q0,a)=q0;-->
<!--d(q0,b)=q1;-->
<!--d(q1,b)=q2;-->
<!--d(q2,b)=q1;-->
<!--d(q2,a)=q0;-->
<!--//-->
<!--//-->
<!--d(q0,a)=q1;-->
<!--d(q1,a)=q2;-->
<!--d(q1,b)=q1;-->
<!--d(q1,c)=q3;-->
<!--d(q2,a)=q3;-->
<!--NFA-->
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
<!--d(q0,E)=q1;-->
<!--d(q0,E)=q2;-->
<!--d(q1,0)=q3;-->
<!--d(q2,1)=q3;-->
<!--//-->
<!--//-->
<!--d(q0,0)=q0;-->
<!--d(q0,0)=q1;-->
<!--d(q0,1)=q1;-->
<!--d(q1,1)=q0;-->
<!--d(q1,1)=q1;-->

<script lang="ts">

    import {configuration_store, graph_store, resetInputVar} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";

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

        let rows = textInput.split("\n").filter(Boolean);

        if ($graph_store.type == "DFA") {
            applyHighlightsDFA(textInput);

            for (let row of rows) {
                if (validateTransitionDFA(row)) {
                    parseRow(row);
                    correctInput = true;
                } else {
                    correctInput = false;
                }
            }
        } else if ($graph_store.type == "NFA") {
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

        graph_store.update((n) => {
            n.transitions = transitions;
            n.input_alphabet = alphabet;
            return n;
        });


        storeNodes();
    }

    function validateTransition(transition) {
        let regex = /d\([A-Za-z]+[0-9]+,[A-Za-z0-9]\)=[A-Za-z]+[0-9];/;
        return regex.test(transition);
    }

    function validateTransitionDFA(transition) {
        let regex = /^d\([A-Za-z]+[0-9]+,[^E]\)=[A-Za-z]+[0-9]+;$/;
        return regex.test(transition);
    }

    function applyHighlightsDFA(text) {
        return text
            .replace(/\n$/g, '\n\n')
            .replace(/(d\([A-Za-z]+[0-9]+,[^E]\)=[A-Za-z]+[0-9]+;)/g, function(match, validTransition, other) {
                if (validTransition) {
                    console.log("Valid transition: ", validTransition);
                    return match;  // If it matches the pattern, leave it unchanged
                } else {
                    console.log("Invalid transition: ", match);
                    return '<mark>' + match + '</mark>';  // If it doesn't match, wrap the entire line in <mark> tags
                }
            });
    }

    function applyHighlights(text) {
        return text
            .replace(/\n$/g, '\n\n')
            .replace(/(d\([A-Za-z]+[0-9]+,[A-Za-z0-9]\)=[A-Za-z]+[0-9];)|(.*)/g, function(match, pattern, other) {
                if (pattern) {
                    // correctInput = true;
                    return match;  // If it matches the pattern, leave it unchanged
                } else {
                    console.log("Invalid transition: ", match);
                    // correctInput = false;
                    return '<mark>' + match + '</mark>';  // If it doesn't match, wrap the entire line in <mark> tags
                }
            });
    }

    function handleScroll() {
        let scrollTop = textarea.scrollTop;
        backdrop.scrollTop = scrollTop;
    }

    // function handleInput() {
    //     applyHighlights(textInput);
    // }

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