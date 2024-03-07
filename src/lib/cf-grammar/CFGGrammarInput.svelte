<script lang="ts">
    import {user_grammar_store} from "../../stores/graphInitStore";
    import {CFGRule} from "./ContextFreeGrammar";
    import {afterUpdate} from "svelte";

    $: if ($user_grammar_store.rules) {
        user_grammar_store.update(n => {
            n.updateTerminalsAndNonTerminals();
            return n;
        });

        if (wrapper) scrollToBottom();

        // console.log($user_grammar_store.toString());
    }

    // reset the grammar store
    user_grammar_store.reset();

// 2+3
// (4*5)+6
// 7*(8+9)
// 1

    // grammar row object
    let row1 = new CFGRule('P', ["P*F", "P/F", "F"]);
    let row2 = new CFGRule('F', ["(S)", "N"]);
    let row3 = new CFGRule('N', ["1N", "2N", "3N", "4N", "1", "2", "3", "4"]);

    // grammar object
    user_grammar_store.update(n => {
        n.addRule(row1);
        n.addRule(row2);
        n.addRule(row3);
        return n;
    });

    // console.log($user_grammar_store);

    function updateRows() {
        user_grammar_store.update(n => {
            n.setUpdateRules(true);
            return n;
        });
    }

    function removeRow(row: number) {
        user_grammar_store.update(n => {
            n.removeRule(row);
            return n;
        });

        updateRows();
    }

    function addRow(rule: CFGRule) {
        user_grammar_store.update(n => {
            n.addRule(rule);
            return n;
        });

        updateRows();
    }

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

        // updateRows();
        return;
    }

    function checkIfBackspace(row: number, col: number, event) {
        // if user pressed backspace and the input is empty, remove the input
        if (event.keyCode === 8 && $user_grammar_store.rules[row].rightSide[col].length === 0) {
            event.preventDefault(); // Prevent browser default backspace behavior
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
                    // inputs[index].setSelectionRange(0, inputs[index].value.length);
                }, 0);
            }
        }
        updateRows();
    }

    let wrapper: HTMLDivElement;

    afterUpdate(() => {
        scrollToBottom();
    });

    const scrollToBottom = async () => {
        wrapper.scroll({ top: wrapper.scrollHeight, behavior: 'smooth' });
    };
</script>

<div class="grammar-wrapper" bind:this={wrapper}>
    {#each $user_grammar_store.rules as row, i}
        <div class="grammar-row">
            {#if i !== 0}
                <button class="delete-button" on:click={() => { removeRow(i) } }>X</button>
            {/if}
            {#if i === 0}
                <button class="delete-button inactive">X</button>

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

    .grammar-wrapper {
        display: flex;
        flex-direction: column;
        width: 90%;
        height: 90%;
        gap: 0.35rem;
        overflow-y: scroll;
        margin-top: 2rem;
    }

    .grammar-row {
        line-height: 2.5rem;
    }

    .add-button {
        width: 30%;
        height: 10%;
    }

    .add-button:hover {
        transition: 0.3s;
        background-color: #d4d8de;
    }

    .delete-button {
        padding: 0 0.5rem;
        border-radius: 100vh;
        margin: 0 0.75rem 0 0;
    }

    .delete-button:hover {
        background-color: #ff0000;
        color: #f4f9ff;
        transition: 0.3s;
    }

    .inactive {
        visibility: hidden;
        cursor: none;
        touch-action: none;
    }
</style>