<script lang="ts">

    import DebugView from "../lib/DebugView.svelte";
    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import ContextFreeGrammarLayout from "../lib/cf-grammar/ContextFreeGrammarLayout.svelte";
    import CFGEditor from "../lib/cf-grammar/CFGEditor.svelte";
    import CFGInput from "../lib/cf-grammar/CFGInput.svelte";
    import Button from "../lib/Button.svelte";
    import CFGInputField from "../lib/cf-grammar/CFGInputField.svelte";
    import CFGResultsField from "../lib/cf-grammar/CFGResultsField.svelte";
    import CFGGrammarInput from "../lib/cf-grammar/CFGGrammarInput.svelte";

    const landingPageUrl = "/Theoretical-informatics-tool"
</script>

<DebugView>
    <main>
        <ThemeToggle />
        <ContextFreeGrammarLayout title="Context-free Grammar">
            <CFGEditor slot="cfg-editor">
                <CFGGrammarInput slot="grammar-input" />
                <Button slot="back-button" type="back" text="Back" url={landingPageUrl} />
                <Button slot="convert-button" type="process" text="Convert to PDA" url={landingPageUrl} />
            </CFGEditor>
            <CFGInput slot="cfg-input">
                <CFGInputField />
            </CFGInput>
<!--            <CFGResults slot="cfg-results">-->
<!--                <CFGResultsField />-->
<!--            </CFGResults>-->
            <CFGResultsField slot="cfg-results" />
        </ContextFreeGrammarLayout>
    </main>
</DebugView>