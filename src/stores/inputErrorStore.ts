import {type Writable, writable} from "svelte/store";

export const input_error_store = function() {
    const {set, update, subscribe} : Writable<Partial<InputError>> = writable({
        startState: true,
        finishState: true,
        transitions: true,
    });

    const reset = () => {
        set({
            startState: true,
            finishState: true,
            transitions: true,
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();