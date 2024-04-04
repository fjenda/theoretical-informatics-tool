/*
    State.ts
    Part of the Earley Parser
    A class that represents a state in the Earley parser.
    A state is a set of Earley items that are processed by the Earley parser.

    Author: Jan Fojtík
*/

import {EarleyItem} from './EarleyItem';

export class State {
    // Items in the state
    items: EarleyItem[] = [];

    // Function that adds an item to the state
    push(item: EarleyItem) {
        this.items.push(item);
    }

    // Function that gets an item from the state by index
    // params:  index: number   - index of the item to get
    // returns: EarleyItem      - the item at the given index
    get(index: number) {
        return this.items[index];
    }

    // Function that returns the number of items in the state
    // returns: number - the number of items in the state
    size() {
        return this.items.length;
    }

    // Function that returns a string representation of the state
    toString() {
        return this.items.map(item => item.toString()).join('\n');
    }
}