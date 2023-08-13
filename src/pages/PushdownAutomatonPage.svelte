<script lang="ts">

import DebugView from "../lib/DebugView.svelte";
import PushdownAutomatonLayout from "../lib/PushdownAutomatonLayout.svelte";
import GraphWindow from "../lib/GraphWindow.svelte";
import GraphControlPanel from "../lib/GraphControlPanel.svelte";
import Button from "../lib/Button.svelte";
import TestInput from "../lib/TestInput.svelte";
import ThemeToggle from "../lib/ThemeToggle.svelte";

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
            <GraphWindow />
        </PushdownAutomatonLayout>
    </main>
</DebugView>