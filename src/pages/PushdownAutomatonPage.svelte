<script lang="ts">

    // components
    import PushdownAutomatonLayout from "../lib/pushdown-automaton-components/PushdownAutomatonLayout.svelte";
    import GraphWindow from "../lib/pushdown-automaton-components/GraphWindow.svelte";
    import GraphControlPanel from "../lib/pushdown-automaton-components/GraphControlPanel.svelte";
    import Button from "../lib/Button.svelte";
    import TestInput from "../lib/pushdown-automaton-components/TestInput.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import GraphToolbar from "../lib/pushdown-automaton-components/GraphToolbar.svelte";
    import ToolbarButton from "../lib/pushdown-automaton-components/ToolbarButton.svelte";
    import StackVisualiser from "../lib/pushdown-automaton-components/StackVisualiser.svelte";
    import TypeView from "../lib/pushdown-automaton-components/TypeView.svelte";
    import ConfigurationTable from "../lib/pushdown-automaton-components/ConfigurationTable.svelte";

    // stores
    import {pda_graph_store} from "../stores/graphInitStore";

    import {PDAController} from "../lib/pushdown-automaton-components/pda/PDAController";
    import type {ToolbarFunctions} from "../types/ToolbarFunctions";

    const landingPageUrl = "/Theoretical-informatics-tool"
    let toolbarFunctions : ToolbarFunctions;
    let processTestInputFunction : Function = () => {};
</script>

<main>
    <ThemeToggle />
    <PushdownAutomatonLayout title="Pushdown Automaton">
        <GraphControlPanel slot="control-panel">
            <TestInput bind:processFunction={processTestInputFunction}
                       testInputFunction={PDAController.testInput}
                       nextFunc={toolbarFunctions?.nextTransition}
                       previousFunc={toolbarFunctions?.previousTransition}
                       stopFunc={PDAController.resetTestInput}
            />
            <Button type="test" text="Test" class={$pda_graph_store.status === undefined ? "" : $pda_graph_store.status === "idle" ? "btn-animation-slide-down" : "btn-animation-slide-up"} func={processTestInputFunction} />
            <Button type="back" text="Back" url={landingPageUrl} />
        </GraphControlPanel>
        <GraphWindow bind:toolbarFunctions={toolbarFunctions} slot="window">
            <GraphToolbar>
                <ToolbarButton type="generate-graph" text="Generate graph" func={PDAController.generateGraphFromTransitions} />
                <ToolbarButton type="new-node" text="New node" func={PDAController.addNode} />
                <ToolbarButton type="new-edge" text="New edge" func={PDAController.addEdgeFromButton} />
                <ToolbarButton type="delete-element" text="Delete element" func={PDAController.toggleDelete} />
                <ToolbarButton type="save-graph" text="Save graph" func={PDAController.saveGraph} />
                <ToolbarButton type="load-graph" text="Load graph" func={PDAController.loadGraph} />
                <ToolbarButton type="delete-graph" text="Delete graph" func={PDAController.deleteGraph} />
                <ToolbarButton type="reset-layout" text="Reset layout" func={PDAController.resetLayout} />
                <ToolbarButton type="show-definition" text="Show definition" func={PDAController.generateConfiguration} />
            </GraphToolbar>
            <TypeView slot="type" type={$pda_graph_store.type} />
            <StackVisualiser slot="stack"/>
        </GraphWindow>
        <ConfigurationTable slot="table"/>
    </PushdownAutomatonLayout>
</main>