<script lang="ts">
    import SetOperationsLayout from "../lib/finite-state-machine-components/SetsOperations/SetOperationsLayout.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import FinGraphControlPanel from "../lib/finite-state-machine-components/FinGraphControlPanel.svelte";
    import FirstGraphWindow from "../lib/finite-state-machine-components/SetsOperations/FirstGraphWindow.svelte";
    import SecondGraphWindow from "../lib/finite-state-machine-components/SetsOperations/SecondGraphWindow.svelte";
    import ResultGrapWindow from "../lib/finite-state-machine-components/SetsOperations/ResultGrapWindow.svelte";
    import FirstTable from "../lib/finite-state-machine-components/SetsOperations/FirstTable.svelte";
    import SecondTable from "../lib/finite-state-machine-components/SetsOperations/SecondTable.svelte";
    import ResultTable from "../lib/finite-state-machine-components/SetsOperations/ResultTable.svelte";
    import OperationsPanel from "../lib/finite-state-machine-components/SetsOperations/OperationsPanel.svelte";
    import OperationButton from "../lib/finite-state-machine-components/SetsOperations/OperationButton.svelte";
    import FirstToolbar from "../lib/finite-state-machine-components/SetsOperations/FirstToolbar.svelte";
    import FirstToolbarButton from "../lib/finite-state-machine-components/SetsOperations/FirstToolbarButton.svelte";

    const landingPageUrl = "/Theoretical-informatics-tool";
    const automatonUrl = "/Theoretical-informatics-tool/tool/finite-state-automaton";

    let toolbarFunctions : ToolbarFunctions;

    let unionFunction : Function = () => {
        console.log("Union");
    };

    let intersectionFunction : Function = () => {
        console.log("Intersection");
    };

    let complementFunction : Function = () => {
        console.log("Complement");
    };

    // let concatenationFunction : Function = () => {
    //     console.log("Concatenation");
    // };

</script>


<main>
    <ThemeToggle />
    <SetOperationsLayout title="Set operations">
        <FirstGraphWindow bind:toolbarFunctions={toolbarFunctions} slot="first-automaton" >
            <FirstToolbar>
                <FirstToolbarButton type="generate-automata" text="Generate graph" func={toolbarFunctions?.generateGraphFromTransitions} />
                <FirstToolbarButton type="new-node" text="New node" func={toolbarFunctions?.addNode} />
                <FirstToolbarButton type="new-edge" text="New edge" func={toolbarFunctions?.addEdge} />
                <FirstToolbarButton type="delete-element" text="Delete element" func={toolbarFunctions?.toggleDelete}/>
                <FirstToolbarButton type="save-graph" text="Save graph" func={toolbarFunctions?.saveGraph} />
                <FirstToolbarButton type="load-graph" text="Load graph" func={toolbarFunctions?.loadGraph} />
                <FirstToolbarButton type="delete-graph" text="Delete graph" func={toolbarFunctions?.deleteGraph}/>
                <FirstToolbarButton type="reset-layout" text="Reset layout" func={toolbarFunctions?.resetLayout} />
                <FirstToolbarButton type="show-definition" text="Show definition" func={toolbarFunctions?.generateConfiguration} />
            </FirstToolbar>
        </FirstGraphWindow>
        <FirstTable slot="first_table" />
        <OperationsPanel slot="operation_bar">
            <OperationButton  text="U" func={unionFunction} />
            <OperationButton  text="∩" func={intersectionFunction} />
            <OperationButton  text="D" func={complementFunction} />
<!--            <OperationButton  text="U" func={unionFunction} />-->
        </OperationsPanel>
        <SecondGraphWindow slot="second-automaton">

        </SecondGraphWindow>
        <SecondTable slot="second-table" />
        <ResultGrapWindow slot="result-automaton" />
        <ResultTable slot="result-table" />
        <FinGraphControlPanel  slot="tool-bar"></FinGraphControlPanel>
    </SetOperationsLayout>
</main>