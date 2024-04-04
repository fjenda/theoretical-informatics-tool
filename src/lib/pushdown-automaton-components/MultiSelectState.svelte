<script>
    import {pda_backup_store, resetInputVar} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";

    let selectedOptions = [];

    $: options = $pda_backup_store.nodes?.map(node => node.id) ?? [];

    $: if ($resetInputVar) {
        selectedOptions = [];
    }

    function handleSelect(event) {
        input_error_store.update((n) => {
            n.finishState = true;
            return n;
        });

        selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        pda_backup_store.update(n => {
            n.finalStates = selectedOptions;
            return n;
        });
    }
</script>

<div class="select-wrapper">
    Final States
    <select class={$input_error_store.finishState} multiple bind:value={selectedOptions} on:change={handleSelect}>
        {#each options as option (option)}
            <option value={option}>{option}</option>
        {/each}
    </select>
</div>

<style>
    .false {
        transition: background-color 0.25s;
        background-color: #ff6969 !important;
    }

    .select-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    select {
        width: 7.5rem;
        height: 10.6rem;
        padding: 0.5rem;

        border: 0.1rem solid #ccc;
        border-radius: 0.3rem;

        font-size: 1rem;
        text-align: center;

        background-color: #eee;
    }

    :global(body.dark-mode) select {
        background-color: #2f3941;
        color: #f4f9ff;
        border: 0.1rem solid #9c81da;
    }
</style>