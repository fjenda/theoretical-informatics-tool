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
            description: "A finite automaton is a simple mathematical model that consists of a control unit with its own state, an input tape that contains the input data, and a reading head. The finite automaton represents a fundamental computational model that is capable of recognizing only regular languages. This model operates by transitioning between states based on the input symbols it reads, following predefined rules. Finite automata are used extensively in the design of digital circuits, parsing of regular expressions, and in the development of various software applications where pattern recognition is required.",
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