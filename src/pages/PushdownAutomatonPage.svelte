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

    const landingPageUrl = "/"
</script>

<DebugView>
    <main>
        <ThemeToggle />
        <PushdownAutomatonLayout title="Pushdown Automaton">
            <GraphControlPanel>
                <TestInput />
                <Button type="test" text="Test" />
                <Button type="back" text="Back" url={landingPageUrl} />
            </GraphControlPanel>
            <GraphWindow>
                <GraphToolbar>
                    <ToolbarButton type="new-node" text="New node" />
                    <ToolbarButton type="new-edge" text="New edge" />
                    <ToolbarButton type="zoom-in" text="Zoom in" />
                    <ToolbarButton type="zoom-out" text="Zoom out" />
                    <ToolbarButton type="delete" text="Delete" />
                    <ToolbarButton type="save-graph" text="Save graph" />
                    <ToolbarButton type="load-graph" text="Load graph" />
                    <ToolbarButton type="delete-graph" text="Delete graph" />
                    <ToolbarButton type="reset-layout" text="Reset layout" />
                </GraphToolbar>
            </GraphWindow>
        </PushdownAutomatonLayout>
    </main>
</DebugView>