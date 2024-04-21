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
import RegexInput from "../lib/finite-state-machine-components/regex/RegexInput.svelte";
import FinConvertTable from "../lib/finite-state-machine-components/FinConvertTable.svelte";
import {graph_store} from "../stores/graphInitStore";
import ThemeToggle from "../lib/ThemeToggle.svelte";


    const landingPageUrl = "/Theoretical-informatics-tool/"
    let toolbarFunctions : ToolbarFunctions;

    let processTestInputFunction : Function = () => {};
    let processRegexInputFunction : Function = () => {};

    let processConvertToDFAFunction : Function = () => {};
</script>

<DebugView>
    <main>
        <ThemeToggle />
        <FiniteStateMachineLayout title="Finite state automaton">
            <FinGraphControlPanel  slot="control-panel">

                <FinTestInput phText="ex. ABA" bind:processFunction={processTestInputFunction}
                                                testInputFunction={toolbarFunctions?.testInput}
                                                nextFunc={toolbarFunctions?.nextTransition}
                                                previousFunc={toolbarFunctions?.previousTransition}
                                                stopFunc={toolbarFunctions?.resetTestInput}
                />
                <Button type="test" text="Test" func={processTestInputFunction} />
                <RegexInput phText="ex. (A+B)*" bind:processFunction={processRegexInputFunction}
                                                regexInputFunction={toolbarFunctions?.regexInput}
                />
                <Button type="test" text="Generate" func={processRegexInputFunction} />
                <Button type="convert" text="Convert to DFA" func={toolbarFunctions?.convertToDFA} />
                <Button type="back" text="Back" url={landingPageUrl} />
            </FinGraphControlPanel>
            <FinGraphWindow bind:toolbarFunctions={toolbarFunctions} slot="window">
                <FinGraphToolbar>
                    <FinToolbarButton type="generate-automata" text="Generate graph" func={toolbarFunctions?.generateGraphFromTransitions} />
                    <FinToolbarButton type="new-node" text="New node" func={toolbarFunctions?.addNodeFromButton} />
                    <FinToolbarButton type="new-edge" text="New edge" func={toolbarFunctions?.addEdgeFromButton} />
                    <FinToolbarButton type="delete-element" text="Delete element" func={toolbarFunctions?.toggleDelete}/>
                    <FinToolbarButton type="save-graph" text="Save graph" func={toolbarFunctions?.saveGraph} />
                    <FinToolbarButton type="load-graph" text="Load graph" func={toolbarFunctions?.loadGraph} />
                    <FinToolbarButton type="delete-graph" text="Delete graph" func={toolbarFunctions?.deleteGraph}/>
                    <FinToolbarButton type="reset-layout" text="Reset layout" func={toolbarFunctions?.resetLayout} />
                    <FinToolbarButton type="show-definition" text="Show definition" func={toolbarFunctions?.generateConfiguration} />
                </FinGraphToolbar>
                <TypeView slot="type" type={$graph_store.type}/>
            </FinGraphWindow>
            <FinTable slot="table"/>
            <FinConvertTable slot="convert-table"/>
        </FiniteStateMachineLayout>
    </main>
</DebugView>