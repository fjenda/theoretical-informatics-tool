<script lang="ts">
    import {user_grammar_store} from "../../stores/graphInitStore";

    // grammar row object
    let grammarRow = {
        isStart: true,
        left: "S",
        right: ['a', 'aAa', ''],
    };

    // grammar row object
    let grammarRow2 = {
        isStart: false,
        left: "A",
        right: ['a', ''],
    };

    // grammar object
    user_grammar_store.update(n => {
        n.rows = [grammarRow, grammarRow2];
        return n;
    });

    console.log($user_grammar_store.rows);

    function checkIfPipeline(row: number, col: number) {
        console.log("checking for pipeline");
        if ($user_grammar_store.rows[row].right[col].includes('|')) {
            let temp = $user_grammar_store.rows[row].right[col].split('|');
            user_grammar_store.update(n => {
                n.rows[row].right.splice(col, 1, ...temp);
                return n;
            });
        }

        return;
    }

</script>

<div class="grammar-wrapper">
    {#each $user_grammar_store.rows as row, i}
        <div class="grammar-row">
            <input class="start-symbol" type="text" bind:value={row.left} /> →
            {#each row.right as right, j}
                <input type="text" bind:value={row.right[j]} on:input={() => { checkIfPipeline(i, j) }} placeholder="ε" />
                {#if j < row.right.length - 1}
                    <span>&nbsp;| &nbsp;</span>
                {/if}
            {/each}
            <button on:click={() => { user_grammar_store.update(n => { n.rows.splice(i, 1); return n;}); } }>X</button>
        </div>
    {/each}
    <button on:click={() => { user_grammar_store.update(n => { n.rows.push({isStart: false, left: '', right: ['']}); return n;}); } }>Add</button>
</div>

<style>
    input {
        margin: 0;
        padding: 0;
        width: 5rem;
    }

    .start-symbol {
        width: 1rem;
        text-align: center;
    }

    .grammar-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 90%;
        height: 90%;
    }
</style>