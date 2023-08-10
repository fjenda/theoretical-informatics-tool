<script lang="ts">

import DebugView from "../lib/DebugView.svelte";
import PushdownAutomatonLayout from "../lib/PushdownAutomatonLayout.svelte";
import GraphWindow from "../lib/GraphWindow.svelte";
</script>

<DebugView>
    <main>
        <PushdownAutomatonLayout title="Pushdown Automaton">
            <GraphWindow />
        </PushdownAutomatonLayout>
    </main>
</DebugView>