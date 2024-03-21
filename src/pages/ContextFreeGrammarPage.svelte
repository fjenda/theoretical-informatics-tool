<script lang="ts">

    import ThemeToggle from "../lib/ThemeToggle.svelte";
    import ContextFreeGrammarLayout from "../lib/cf-grammar/ContextFreeGrammarLayout.svelte";
    import CFGEditor from "../lib/cf-grammar/CFGEditor.svelte";
    import CFGInput from "../lib/cf-grammar/CFGInput.svelte";
    import Button from "../lib/Button.svelte";
    import CFGInputField from "../lib/cf-grammar/CFGInputField.svelte";
    import CFGResultsField from "../lib/cf-grammar/CFGResultsField.svelte";
    import CFGGrammarInput from "../lib/cf-grammar/CFGGrammarInput.svelte";
    import {Converter} from "../lib/cf-grammar/Converter";
    import {graph_store, user_grammar_store} from "../stores/graphInitStore";
    import type {ContextFreeGrammar} from "../lib/cf-grammar/ContextFreeGrammar";
    import ToolbarButton from "../lib/pushdown-automaton-components/ToolbarButton.svelte";

    const landingPageUrl = "/Theoretical-informatics-tool"
    const automatonUrl = "/Theoretical-informatics-tool/tool/pushdown-automaton"
    const converter = new Converter({});

    function convert()
    {
        // update nt and t
        user_grammar_store.update((n) => {
            n.updateTerminalsAndNonTerminals();
            return n;
        });

        graph_store.update((n) => {
            n.type = "cfg";
            return n;
        });


        // create a copy of the store
        const grammarCopy: ContextFreeGrammar = {};
        Object.assign(grammarCopy, $user_grammar_store);
        converter.setGrammar(grammarCopy);
        converter.convertToPDA();

        console.log($graph_store.transitions);
    }

</script>

<main>
    <ThemeToggle />
    <ContextFreeGrammarLayout title="Context-free Grammar">
        <CFGEditor slot="cfg-editor">
            <ToolbarButton slot="definition" type="cfg-definition" text="Show definition" func={() => $user_grammar_store.toString()} />
            <CFGGrammarInput slot="grammar-input" />
            <Button slot="back-button" type="back" text="Back" url={landingPageUrl} />
            <Button slot="convert-button" type="process" text="Convert to PDA" func={() => convert()} url={automatonUrl} />
        </CFGEditor>
        <CFGInput slot="cfg-input">
            <CFGInputField />
        </CFGInput>
<!--        <CFGResults slot="cfg-results">-->
<!--            <CFGResultsField />-->
<!--        </CFGResults>-->
        <CFGResultsField slot="cfg-results" />
    </ContextFreeGrammarLayout>
</main>