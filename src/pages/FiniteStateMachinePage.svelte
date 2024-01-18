<script lang="ts">
import Button from "../lib/Button.svelte";
import DebugView from "../lib/DebugView.svelte";
import FiniteStateMachineLayout from "../lib/finite-state-machine-components/FiniteStateMachineLayout.svelte";
import FinTestInput from "../lib/finite-state-machine-components/FinTestInput.svelte";
import FinGraphControlPanel from "../lib/finite-state-machine-components/FinGraphControlPanel.svelte";
import FinGraphWindow from "../lib/finite-state-machine-components/FinGraphWindow.svelte";
import FinToolbarButton from "../lib/finite-state-machine-components/FinToolbarButton.svelte";
import FinGraphToolbar from "../lib/finite-state-machine-components/FinGraphToolbar.svelte";
import ConfigurationTable from "../lib/pushdown-automaton-components/ConfigurationTable.svelte";
import FinTable from "../lib/finite-state-machine-components/FinTable.svelte";
import TypeView from "../lib/pushdown-automaton-components/TypeView.svelte";
import GraphControlPanel from "../lib/pushdown-automaton-components/GraphControlPanel.svelte";


    const landingPageUrl = "/Theoretical-informatics-tool/"
    let toolbarFunctions : ToolbarFunctions;

    let processTestInputFunction : Function = () => {};
</script>

<DebugView>
    <main>
        <FiniteStateMachineLayout title="Finite state automaton">
            <FinGraphControlPanel  slot="control-panel">
<!--                <div style='text-align: center;'>-->
<!--                    <Button type="dfa" text="NFA" />-->
<!--                    <Button type="dfa" text="DFA" />-->
<!--                </div>-->
                <FinTestInput phText="ex. ABA" bind:processFunction={processTestInputFunction}
                                                testInputFunction={toolbarFunctions?.testInput}
                                                nextFunc={toolbarFunctions?.nextTransition}
                                                previousFunc={toolbarFunctions?.previousTransition}
                                                stopFunc={toolbarFunctions?.resetTestInput}
                />
                <Button type="test" text="Test" func={processTestInputFunction} />
                <FinTestInput phText="ex. (A+B)*" />
                <Button type="test" text="Generate" />
                <Button type="back" text="Back" url={landingPageUrl} />
            </FinGraphControlPanel>
            <FinGraphWindow bind:toolbarFunctions={toolbarFunctions} slot="window">
                <FinGraphToolbar>
                    <FinToolbarButton type="generate-automata" text="Generate graph" func={toolbarFunctions?.generateGraphFromTransitions} />
                    <FinToolbarButton type="new-node" text="New node" func={toolbarFunctions?.addNode} />
                    <FinToolbarButton type="new-edge" text="New edge" func={toolbarFunctions?.addEdge} />
                    <FinToolbarButton type="delete-element" text="Delete element" func={toolbarFunctions?.toggleDelete}/>
                    <FinToolbarButton type="save-graph" text="Save graph" func={toolbarFunctions?.saveGraph} />
                    <FinToolbarButton type="load-graph" text="Load graph" func={toolbarFunctions?.loadGraph} />
                    <FinToolbarButton type="delete-graph" text="Delete graph" func={toolbarFunctions?.deleteGraph}/>
                    <FinToolbarButton type="reset-layout" text="Reset layout" func={toolbarFunctions?.resetLayout} />
                    <FinToolbarButton type="show-configuration" text="Show configuration" func={toolbarFunctions?.generateConfiguration} />
                </FinGraphToolbar>
                <TypeView slot="type"/>
            </FinGraphWindow>
            <ConfigurationTable slot="table"/>
        </FiniteStateMachineLayout>
    </main>
</DebugView>