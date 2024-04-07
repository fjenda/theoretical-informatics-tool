<script lang="ts">
    import HomePageLayout from "../lib/HomePageLayout.svelte";
    import GlassPanel from "../lib/GlassPanel.svelte";
    import type {ToolMeta} from "../types/ToolMeta";
    import Button from "../lib/Button.svelte";
    import Flare from "../lib/Flare.svelte";

    const tools : ToolMeta [] = [
        {
            title: "Finite-state automaton",
            author: "Marek Krúpa",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.",
            scriptsUrl: "finite-state-machine-scripts",
            toolUrl: "/Theoretical-informatics-tool/tool/finite-state-automaton",
        },
        {
            title: "Pushdown automaton",
            author: "Jan Fojtík",
            description: "Pushdown automaton is a type of automaton that employs a stack. Pushdown automata are used in theories about what can be computed by machines. They are more capable than finite-state machines but less capable than Turing machines. Deterministic pushdown automata can recognize all deterministic context-free languages while nondeterministic ones can recognize all context-free languages, with the former often used in parser design.",
            scriptsUrl: "pushdown-automaton-scripts",
            toolUrl: "/Theoretical-informatics-tool/tool/pushdown-automaton",
        }
    ]
</script>

<main>
    <Flare />
    <HomePageLayout title="Theoretical Informatics Tool for Students">
        {#each tools as tool}
            <GlassPanel info={tool}>
<!--                <Button type="read-more" text="Read more" url={tool.scriptsUrl} />-->
                <Button type="tool" text="Tool" url={tool.toolUrl} />
            </GlassPanel>
        {/each}
    </HomePageLayout>
</main>