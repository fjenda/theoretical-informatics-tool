import {type Writable, writable} from "svelte/store";

export const user_grammar_store = function () {
    const {set, update, subscribe} : Writable<Partial<object>> = writable({
        rows: [],
    });

    const reset = () => {
        set({
            rows: [],
        });
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
    const {set, update, subscribe} : Writable<Partial<GraphObject>> = writable({
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