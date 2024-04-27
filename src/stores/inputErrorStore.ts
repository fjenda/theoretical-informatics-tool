import {type Writable, writable} from "svelte/store";
import type {InputError} from "../types/InputError";


export const input_error_store = function() {
    const {set, update, subscribe} : Writable<Partial<InputError>> = writable({
        type: true,
        startState: true,
        finishState: true,
        transitions: true,
        table: true,
    });

    const reset = () => {
        set({
            type: true,
            startState: true,
            finishState: true,
            transitions: true,
            table: true,
        });
    }

    return {
        set,
        update,
        subscribe,
        reset,
    }
}();