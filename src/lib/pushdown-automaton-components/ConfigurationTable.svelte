<script lang="ts">
    import {graph_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import { fly } from "svelte/transition";

    let show_configuration : boolean = false;

    let traversal = [];
    $: if ($graph_store.traversal && $graph_store.traversal.length) {
        // do something when this store value changes
        console.log("AWADA KEDAWRA");

        // get traversal
        traversal = $graph_store.traversal;
    }

    $: if ($input_error_store.table) {
        // do something when this store value changes
        console.log("O KURWA RAKETA");

        // empty traversal
        traversal = [];

        // set to false
        $input_error_store.table = false;
    }

    function showConfiguration() {
        // if (traversal.length === 0) {
        //     return;
        // }

        show_configuration = !show_configuration;
        console.log("show_configuration: " + show_configuration);
    }
</script>

<div id="configuration-div" class:expanded={show_configuration} class:small={!show_configuration}>
    <div id="arrow" on:click={() => showConfiguration()}>
        <p>Configuration</p>
    </div>

    {#if show_configuration}
        <table transition:fly={{ x: 200, duration: 500 }}>
            <thead>
            <tr>
                <th colspan="5">Configuration</th>
            </tr>
            </thead>
            <tbody>
            {#each traversal as row}
                <tr>
                    <td>{row.state}</td>
                    <td>{row.input}</td>
                    <td>{row.stack}</td>
                    <td>{row.stateAfter}</td>
                    <td>{row.stackAfter}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    {/if}
</div>


<style>
    #configuration-div {
        display: flex;
        height: fit-content;
    }

    .expanded {
        translate: -9rem;
        width: 10rem;
        transition: translate 0.5s;
    }

    .small {
        width: fit-content;
        margin-left: 0;
    }

    p {
        writing-mode: vertical-lr;
        text-orientation: upright;
    }

    #arrow {
        height: fit-content;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    #arrow:hover {
        cursor: pointer;
    }

    table {
        border-collapse: collapse;
        width: 50%;
        height: fit-content;
        margin-right: 1rem;
    }

    th, td {
        border: 0.05rem solid #dddddd;
        text-align: left;
        padding: 0.5rem;
    }

    th {
        background-color: #a9b1b9;
    }
</style>