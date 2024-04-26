import {type Writable, writable} from "svelte/store";
import {ContextFreeGrammar} from "../lib/cf-grammar/cfg/ContextFreeGrammar";
import {GrammarResult} from "../lib/cf-grammar/cfg/GrammarResult";
import type {GraphObject} from "../types/GraphObject";
import type {AutomatonConfiguration} from "../types/AutomatonConfiguration";
import {FiniteStateAutomaton} from "../lib/finite-state-machine-components/FiniteStateAutomaton";
import type {PDAConfigurationType} from "../types/pda-cfg/PDAConfigurationType";
import {PushdownAutomaton} from "../lib/pushdown-automaton-components/pda/PushdownAutomaton";
import type {InitializationType} from "../types/pda-cfg/InitializationType";

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
export const pda_configuration_store = function () {
    const {set, update, subscribe} : Writable<Partial<PDAConfigurationType>> = writable({});

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
export const pda_graph_store = function () {
    const {set, update, subscribe} : Writable<Partial<PushdownAutomaton>> = writable(new PushdownAutomaton());

    const reset = () => {
        set(new PushdownAutomaton());
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

export const pda_backup_store = function () {
    const {set, update, subscribe} : Writable<Partial<InitializationType>> = writable({});

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

export const fin_graph_store = function () {
    const {set, update, subscribe} : Writable<Partial<FiniteStateAutomaton>> = writable(new FiniteStateAutomaton([], [], [], [], "DFA"));

    const reset = () => {
        set(new FiniteStateAutomaton([], [], [], [], "DFA"));
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();


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

export const first_configuration_store = function() {
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

export const second_configuration_store = function() {
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

export const result_configuration_store = function() {
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
    const {set, update, subscribe} : Writable<Partial<GraphObject>> = writable({
        nodes: [],
        type: "empty",
    });

    const reset = () => {
        set({
            nodes: [],
            type: "empty",
            followingID: 0,
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

export const first_graph_store = function() {
    const {set, update, subscribe} : Writable<Partial<GraphObject>> = writable({
        nodes: [],
        type: "empty",
    });

    const reset = () => {
        set({
            nodes: [],
            type: "empty",
            followingID: 0,
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

export const second_graph_store = function() {
    const {set, update, subscribe} : Writable<Partial<GraphObject>> = writable({
        nodes: [],
        type: "empty",
    });

    const reset = () => {
        set({
            nodes: [],
            type: "empty",
            followingID: 0,
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

export const result_graph_store = function() {
    const {set, update, subscribe} : Writable<Partial<GraphObject>> = writable({
        nodes: [],
        type: "empty",
    });

    const reset = () => {
        set({
            nodes: [],
            type: "empty",
            followingID: 0,
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();

