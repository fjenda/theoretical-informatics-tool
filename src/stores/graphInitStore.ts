import {type Writable, writable} from "svelte/store";

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