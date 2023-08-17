<script lang="ts">
import Button from "../lib/Button.svelte";
import DebugView from "../lib/DebugView.svelte";
import FiniteStateMachineLayout from "../lib/finite-state-machine-components/FiniteStateMachineLayout.svelte";
import FinTestInput from "../lib/finite-state-machine-components/FinTestInput.svelte";
import FinGraphControlPanel from "../lib/finite-state-machine-components/FinGraphControlPanel.svelte";
import FinGraphWindow from "../lib/finite-state-machine-components/FinGraphWindow.svelte";
import FinToolbarButton from "../lib/finite-state-machine-components/FinToolbarButton.svelte";
import FinGraphToolbar from "../lib/finite-state-machine-components/FinGraphToolbar.svelte";



    const landingPageUrl = "/"
    let toolbarFunctions : ToolbarFunctions;
</script>

<DebugView>
    <main>
        <FiniteStateMachineLayout title="Finite state machine">
            <FinGraphControlPanel>
                <FinTestInput/>
                <Button type="test" text="Test" />
                <Button type="back" text="Back" url={landingPageUrl} />
            </FinGraphControlPanel>
            <FinGraphWindow bind:toolbarFunctions={toolbarFunctions}>
                <FinGraphToolbar>
                    <FinToolbarButton type="new-node" text="New node" func={toolbarFunctions?.addNode} />
                    <FinToolbarButton type="new-edge" text="New edge" func={toolbarFunctions?.addEdge} />
                    <FinToolbarButton type="zoom-in" text="Zoom in" func={toolbarFunctions?.zoomIn} />
                    <FinToolbarButton type="zoom-out" text="Zoom out" func={toolbarFunctions?.zoomOut} />
                    <FinToolbarButton type="delete-element" text="Delete element" func={toolbarFunctions?.deleteGraphElement}/>
                    <FinToolbarButton type="save-graph" text="Save graph" func={toolbarFunctions?.saveGraph} />
                    <FinToolbarButton type="load-graph" text="Load graph" func={toolbarFunctions?.loadGraph} />
                    <FinToolbarButton type="delete-graph" text="Delete graph" func={toolbarFunctions?.deleteGraph}/>
                    <FinToolbarButton type="reset-layout" text="Reset layout" func={toolbarFunctions?.resetLayout} />
                </FinGraphToolbar>
            </FinGraphWindow>
        </FiniteStateMachineLayout>
    </main>
</DebugView>