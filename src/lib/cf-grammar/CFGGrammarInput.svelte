<!--
LHS Grammar Window for editing the grammar
-->

<script lang="ts">
    import {user_grammar_store} from "../../stores/graphInitStore";
    import {CFGRule} from "./cfg/CFGRule";
    import {afterUpdate} from "svelte";

    let wrapper: HTMLDivElement;

    // Reactive statement that updates the grammar store whenever there's a change in the grammar.
    $: if ($user_grammar_store.rules) {
        user_grammar_store.update(n => {
            n.updateTerminalsAndNonTerminals();
            n.validateInputs();
            return n;
        });

        if (wrapper) scrollToBottom();
    }

    // Initial grammar that's loaded
    // reset the grammar store
    user_grammar_store.reset();

    // grammar row object
    let row1 = new CFGRule('P', ["P*F", "P/F", "F"]);
    let row2 = new CFGRule('F', ["(S)", "N"]);
    let row3 = new CFGRule('N', ["0N", "1N", "2N", "3N", "4N", "0", "1", "2", "3", "4"]);

    // grammar object
    user_grammar_store.update(n => {
        n.addRule(row1);
        n.addRule(row2);
        n.addRule(row3);
        return n;
    });

    // Function that updates the grammar store rows
    function updateRows() {
        user_grammar_store.update(n => {
            n.setUpdateRules(true);
            return n;
        });
    }

    // Function that removes a row from the grammar store
    function removeRow(row: number) {
        user_grammar_store.update(n => {
            n.removeRule(row);
            return n;
        });

        updateRows();
    }

    // Function that adds a row to the grammar store
    function addRow(rule: CFGRule) {
        user_grammar_store.update(n => {
            n.addRule(rule);
            return n;
        });

        updateRows();
    }

    // Function that splits a text input whenever a pipeline is pressed into two
    function checkIfPipeline(row: number, col: number) {
        // if user types a pipeline, split the input into multiple inputs
        if ($user_grammar_store.rules[row].rightSide[col].includes('|')) {
            let temp = $user_grammar_store.rules[row].rightSide[col].split('|');
            user_grammar_store.update(n => {
                n.rules[row].rightSide.splice(col, 1, ...temp);
                return n;
            });

            // focus the next input
            setTimeout(() => {
                let inputs = document.querySelectorAll('.right-side');

                // count the index
                let index = 0;
                for (let i = 0; i < row; i++) {
                    index += $user_grammar_store.rules[i].rightSide.length;
                }
                index += col + temp.length - 1;

                inputs[index].focus();
            }, 0);
        }

        return;
    }

    // Function that removes a text input whenever a backspace is pressed inside an empty input
    function checkIfBackspace(row: number, col: number, event: KeyboardEvent) {
        // if user pressed backspace and the input is empty, remove the input
        if (event.key === "Backspace" && $user_grammar_store.rules[row].rightSide[col].length === 0) {
            // if it's not the first input, remove the input and move focus to the previous one
            if (col > 0) {
                user_grammar_store.update(n => {
                    n.rules[row].rightSide.splice(col, 1);
                    return n;
                });
                setTimeout(() => {
                    let inputs = document.querySelectorAll('.right-side');

                    // count the index
                    let index = 0;
                    for (let i = 0; i < row; i++) {
                        index += $user_grammar_store.rules[i].rightSide.length;
                    }
                    index += col - 1;

                    inputs[index].focus();
                }, 0);
            }
        }
        updateRows();
    }

    // Function that does smooth scrolling whenever there are too many rules
    const scrollToBottom = async () => {
        wrapper.scroll({ top: wrapper.scrollHeight, behavior: 'smooth' });
    };

    afterUpdate(() => {
        scrollToBottom();
    });
</script>

<div class="grammar-wrapper" bind:this={wrapper}>
    {#each $user_grammar_store.rules as row, i}
        <div class="grammar-row">
            {#if i !== 0} <!-- Starting rule (no delete button) -->
                <button class="delete-button" on:click={() => { removeRow(i) } }></button>
            {/if}
            {#if i === 0} <!-- Other rules -->
                <button class="delete-button inactive"></button>

                <input class="left-side padding-left"
                       maxlength="1"
                       type="text"
                       disabled
                       bind:value={row.leftSide} />
            {:else}
                <input class="left-side"
                       maxlength="1"
                       type="text"
                       bind:value={row.leftSide} />
            {/if}
            <span>&nbsp;→&nbsp;</span>
            {#each row.rightSide as right, j}
                <input class="right-side"
                       type="text"
                       bind:value={right}
                       on:input={() => { checkIfPipeline(i, j); }}
                       on:keydown={(event) => { checkIfBackspace(i, j, event) } }
                       placeholder="ε" />
                {#if j < row.rightSide.length - 1}
                    <span>&nbsp;｜&nbsp;</span>
                {/if}
            {/each}
        </div>
    {/each}
    <button class="add-button" on:click={() => { addRow(new CFGRule('', [''])) } }>Add rule</button>
</div>

<style>
    *:disabled {
        background-color: #f4f9ff;
    }

    input, button {
        margin: 0;
        padding: 0;

        border: 0.05rem solid #101820;
        border-radius: 0.3rem;
        background-color: #f4f9ff;

        font: 1.5rem/2rem 'Open Sans', sans-serif;
    }

    input {
        width: 5rem;
        text-align: center;
    }

    button {
        background-color: #f4f9ff;
        cursor: pointer;
        padding: 0 1rem;
    }

    span {
        font: 1.5rem/2rem 'Open Sans', sans-serif;
    }

    .left-side {
        width: 3rem;
    }

    .right-side {
        width: 6.6rem;
    }

    .grammar-wrapper {
        display: flex;
        flex-direction: column;
        width: 90%;
        height: 90%;
        gap: 0.35rem;
        overflow-y: auto;
        margin-top: 3rem;
    }

    .grammar-row {
        line-height: 2.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }

    .add-button {
        width: 30%;
        height: 2.5rem;
    }

    .add-button:hover {
        transition: 0.3s;
        background-color: #d4d8de;
    }

    .delete-button {
        padding: 0 0.5rem;
        border-radius: 100vh;
        margin: 0 0.75rem 0 0;

        background-color: transparent;
        background-image: url("../../assets/delete.svg");
        background-size: contain;
        background-repeat: no-repeat;

        aspect-ratio: 1/1;
        width: 40px;
        border: none;
    }

    :global(body.dark-mode) .delete-button {
        filter: invert(1);
    }

    :global(body.dark-mode) .delete-button:hover {
        color: #f4f9ff;
        filter: brightness(0) saturate(100%) invert(13%) sepia(81%) saturate(7248%) hue-rotate(360deg) brightness(104%) contrast(114%);
    }

    .delete-button:hover {
        color: #f4f9ff;
        filter: brightness(0) saturate(100%) invert(13%) sepia(81%) saturate(7248%) hue-rotate(360deg) brightness(104%) contrast(114%);
    }

    .inactive {
        visibility: hidden;
        cursor: none;
        touch-action: none;
    }
</style>