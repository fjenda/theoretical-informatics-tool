<script lang="ts">

    import DebugView from "../lib/DebugView.svelte";
    import PushdownAutomatonLayout from "../lib/pushdown-automaton-components/PushdownAutomatonLayout.svelte";
    import GraphWindow from "../lib/pushdown-automaton-components/GraphWindow.svelte";
    import GraphControlPanel from "../lib/pushdown-automaton-components/GraphControlPanel.svelte";
    import Button from "../lib/Button.svelte";
    import TestInput from "../lib/pushdown-automaton-components/TestInput.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import GraphToolbar from "../lib/pushdown-automaton-components/GraphToolbar.svelte";
    import ToolbarButton from "../lib/pushdown-automaton-components/ToolbarButton.svelte";
    import TransitionFunctionInput from "../lib/pushdown-automaton-components/TransitionFunctionInput.svelte";
    import StackVisualiser from "../lib/pushdown-automaton-components/StackVisualiser.svelte";
    import ThreeWaySwitch from "../lib/pushdown-automaton-components/ThreeWaySwitch.svelte";

    const landingPageUrl = "/"
    let toolbarFunctions : ToolbarFunctions;
    let processTransitionsFunction : Function = () => {};
    let processTestInputFunction : Function = () => {};
</script>

<DebugView>
    <main>
        <ThemeToggle />
        <PushdownAutomatonLayout title="Pushdown Automaton">
            <GraphControlPanel>
                <TestInput bind:processFunction={processTestInputFunction}
                           testInputFunction={toolbarFunctions?.testInput}
                           nextFunc={toolbarFunctions?.nextTransition}
                           previousFunc={toolbarFunctions?.previousTransition}
                           stopFunc={toolbarFunctions?.resetTestInput}
                />
                <Button type="test" text="Test" func={processTestInputFunction} />
                <ThreeWaySwitch />
                <Button type="back" text="Back" url={landingPageUrl} />
            </GraphControlPanel>
            <GraphWindow bind:toolbarFunctions={toolbarFunctions}>
                <GraphToolbar>
                    <ToolbarButton type="generate-graph" text="Generate graph" func={toolbarFunctions?.generateGraphFromTransitions} />
                    <ToolbarButton type="new-node" text="New node" func={toolbarFunctions?.addNode} />
                    <ToolbarButton type="new-edge" text="New edge" func={toolbarFunctions?.addEdgeFromButton} />
                    <ToolbarButton type="zoom-in" text="Zoom in" func={toolbarFunctions?.zoomIn} />
                    <ToolbarButton type="zoom-out" text="Zoom out" func={toolbarFunctions?.zoomOut} />
                    <ToolbarButton type="delete-element" text="Delete element" func={toolbarFunctions?.toggleDelete} />
                    <ToolbarButton type="save-graph" text="Save graph" func={toolbarFunctions?.saveGraph} />
                    <ToolbarButton type="load-graph" text="Load graph" func={toolbarFunctions?.loadGraph} />
                    <ToolbarButton type="delete-graph" text="Delete graph" func={toolbarFunctions?.deleteGraph} />
                    <ToolbarButton type="reset-layout" text="Reset layout" func={toolbarFunctions?.resetLayout} />
                    <ToolbarButton type="show-configuration" text="Show configuration" func={toolbarFunctions?.generateConfiguration} />
                    <StackVisualiser stackFunction={toolbarFunctions?.getStack} />
                </GraphToolbar>
            </GraphWindow>
        </PushdownAutomatonLayout>
    </main>
</DebugView>