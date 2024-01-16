<script lang="ts">

    import DebugView from "../lib/DebugView.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import ContextFreeGrammarLayout from "../lib/cf-grammar/ContextFreeGrammarLayout.svelte";

</script>

<DebugView>
    <main>
        <ThemeToggle />
        <ContextFreeGrammarLayout title="Context-free Grammar" />
    </main>
</DebugView>