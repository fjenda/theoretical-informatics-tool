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
    import SecondToolbar from "../lib/finite-state-machine-components/SetsOperations/SecondToolbar.svelte";
    import SecondToolbarButton from "../lib/finite-state-machine-components/SetsOperations/SecondToolbarButton.svelte";
    import FirstTypeView from "../lib/finite-state-machine-components/SetsOperations/FirstTypeView.svelte";
    import SecondTypeView from "../lib/finite-state-machine-components/SetsOperations/SecondTypeView.svelte";
    import ResultToolbar from "../lib/finite-state-machine-components/SetsOperations/ResultToolbar.svelte";
    import ResultToolbarButton from "../lib/finite-state-machine-components/SetsOperations/ResultToolbarButton.svelte";
    import FinTestInput from "../lib/finite-state-machine-components/FinTestInput.svelte";
    import ResultTestInput from "../lib/finite-state-machine-components/SetsOperations/ResultTestInput.svelte";
    import Button from "../lib/Button.svelte";
    import ResultTypeView from "../lib/finite-state-machine-components/SetsOperations/ResultTypeView.svelte";

    const landingPageUrl = "/Theoretical-informatics-tool";
    const automatonUrl = "/Theoretical-informatics-tool/tool/finite-state-automaton";

    let toolbarFunctions : ToolbarFunctions;
    let secondToolbarFunctions : ToolbarFunctions;
    let resutlToolbarFunctions : ToolbarFunctions;

    let processTestInputFunction : Function = () => {};

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
            <FirstTypeView slot="type"/>
        </FirstGraphWindow>
        <FirstTable slot="first_table" />
        <OperationsPanel slot="operation_bar">
            <OperationButton  text="U" func={resutlToolbarFunctions?.unionFunc} />
            <OperationButton  text="∩" func={resutlToolbarFunctions?.intersectionFunc} />
            <OperationButton  text="D" func={resutlToolbarFunctions?.complementFunc} />
            <OperationButton  text="Z" func={resutlToolbarFunctions?.concatenationFunc} />
            <OperationButton  text="R" func={resutlToolbarFunctions?.differenceFunc} />
            <OperationButton  text="I" func={resutlToolbarFunctions?.iterationFunc} />
        </OperationsPanel>
        <SecondGraphWindow bind:secondToolbarFunctions={secondToolbarFunctions} slot="second-automaton">
            <SecondToolbar>
                <SecondToolbarButton type="generate-automata" text="Generate graph" func={secondToolbarFunctions?.generateGraphFromTransitions} />
                <SecondToolbarButton type="new-node" text="New node" func={secondToolbarFunctions?.addNode} />
                <SecondToolbarButton type="new-edge" text="New edge" func={secondToolbarFunctions?.addEdge} />
                <SecondToolbarButton type="delete-element" text="Delete element" func={secondToolbarFunctions?.toggleDelete}/>
                <SecondToolbarButton type="save-graph" text="Save graph" func={secondToolbarFunctions?.saveGraph} />
                <SecondToolbarButton type="load-graph" text="Load graph" func={secondToolbarFunctions?.loadGraph} />
                <SecondToolbarButton type="delete-graph" text="Delete graph" func={secondToolbarFunctions?.deleteGraph}/>
                <SecondToolbarButton type="reset-layout" text="Reset layout" func={secondToolbarFunctions?.resetLayout} />
                <SecondToolbarButton type="show-definition" text="Show definition" func={secondToolbarFunctions?.generateConfiguration} />
            </SecondToolbar>
            <SecondTypeView slot="type"/>
        </SecondGraphWindow>
        <SecondTable slot="second-table" />
        <ResultGrapWindow bind:resutlToolbarFunctions={resutlToolbarFunctions}  slot="result-automaton">
            <ResultToolbar>
                <ResultToolbarButton type="save-graph" text="Save graph" func={resutlToolbarFunctions?.saveGraph}  />
                <ResultToolbarButton type="reset-layout" text="Reset layout" func={resutlToolbarFunctions?.resetLayout} />
                <ResultToolbarButton type="show-definition" text="Show definition" func={resutlToolbarFunctions?.generateConfiguration} />
            </ResultToolbar>
            <ResultTypeView slot="type"/>
        </ResultGrapWindow>
        <ResultTable slot="result-table" />
        <FinGraphControlPanel  slot="tool-bar">
            <ResultTestInput phText="ex. ABA" bind:processFunction={processTestInputFunction}
                          testInputFunction={resutlToolbarFunctions?.testInput}
                          nextFunc={resutlToolbarFunctions?.nextTransition}
                          previousFunc={resutlToolbarFunctions?.previousTransition}
                          stopFunc={resutlToolbarFunctions?.resetTestInput}
            />

            <Button type="test" text="Test" func={processTestInputFunction} />
            <Button type="back" text="Back" url={landingPageUrl} />
        </FinGraphControlPanel>
    </SetOperationsLayout>
</main>