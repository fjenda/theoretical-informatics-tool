/*
    debounce.ts
    Utils for debouncing functions

    Author: Jan Fojtík
*/

export function createDebounce(delay: number): (func: () => void) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (func: () => void) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func();
        }, delay);
    };
}