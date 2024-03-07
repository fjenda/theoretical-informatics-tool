import {type Writable, writable} from "svelte/store";
import {ContextFreeGrammar, GrammarResult} from "../lib/cf-grammar/ContextFreeGrammar";
import type {PushdownAutomaton} from "../lib/pushdown-automaton-components/PushdownAutomaton";

export const grammar_results_store = function() {
    const {set, update, subscribe} : Writable<Partial<GrammarResult[]>> = writable([]);

    const reset = () => {
        set([]);
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();
export const user_grammar_store = function () {
    const {set, update, subscribe} : Writable<Partial<ContextFreeGrammar>> = writable(new ContextFreeGrammar([], [], []));

    const reset = () => {
        set(new ContextFreeGrammar([], [], []));
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

export const stack_store = writable([]);
export const table_index_store = writable(-1);
export const resetInputVar = writable(false);
export const configuration_store = function() {
    const {set, update, subscribe} : Writable<Partial<AutomatonConfiguration>> = writable({});

    const reset = () => {
        set({});
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

export const graph_store = function() {
    const {set, update, subscribe} : Writable<Partial<PushdownAutomaton>> = writable({
        nodes: [],
        type: "empty",
    });

    const reset = () => {
        set({
            nodes: [],
            type: "empty",
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();