<script lang="ts">
    import SetOperationsLayout from "../lib/finite-state-machine-components/SetsOperations/SetOperationsLayout.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import FinGraphWindow from "../lib/finite-state-machine-components/FinGraphWindow.svelte";
    import FinGraphControlPanel from "../lib/finite-state-machine-components/FinGraphControlPanel.svelte";
    import FirstGraphWindow from "../lib/finite-state-machine-components/SetsOperations/FirstGraphWindow.svelte";
    import SecondGraphWindow from "../lib/finite-state-machine-components/SetsOperations/SecondGraphWindow.svelte";
    import ResultGrapWindow from "../lib/finite-state-machine-components/SetsOperations/ResultGrapWindow.svelte";

    const landingPageUrl = "/Theoretical-informatics-tool";
    const automatonUrl = "/Theoretical-informatics-tool/tool/finite-state-automaton";
</script>


<main>
    <ThemeToggle />
    <SetOperationsLayout title="Set operations">
        <FirstGraphWindow slot="first-automaton" />
        <SecondGraphWindow slot="second-automaton" />
        <ResultGrapWindow slot="result-automaton" />
        <FinGraphControlPanel  slot="tool-bar"></FinGraphControlPanel>
    </SetOperationsLayout>
</main>