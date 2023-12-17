<script  lang="ts">
    import {configuration_store, graph_store, resetInputVar} from "../../stores/graphInitStore";


    $: if ($graph_store.traversal && $graph_store.traversal.length) {
        // do something when this store value changes
        console.log("O KURWA RAKETA");
    }
</script>

<table>
    <thead>
    <tr>
        <th colspan="5">Configuration</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>State</td>
        <td>Input</td>
        <td>Stack</td>
        <td>Next State</td>
        <td>New Stack</td>
    </tr>

    </tbody>
</table>

<style>
    table {
        border-collapse: collapse;
        width: 30%;
        height: fit-content;
    }

    th, td {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #e5e5e5;
    }
</style>