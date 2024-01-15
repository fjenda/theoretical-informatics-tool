<script lang="ts">

    import DebugView from "../lib/DebugView.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import Test from "../lib/cf-grammar-to-automaton-components/Test.svelte";

</script>

<DebugView>
    <main>
        <ThemeToggle />
        <Test />
    </main>
</DebugView>