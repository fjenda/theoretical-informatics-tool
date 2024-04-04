/*
    EarleyItem.ts
    Part of the Earley Parser
    A class that represents an item in the Earley parser.
    An item is a rule with a dot at some position and a start position where the item was created.

    Author: Jan Fojtík
*/

import {Rule} from "./Rule";
import {ItemAction} from "./ItemAction";

export class EarleyItem {
    // Rule of the item
    rule: Rule;

    // Dot position
    dot: number;

    // Start position
    start: number;

    // Action which created this item
    action: ItemAction;

    // From which items this item was created
    from: [number, number][];

    // Constructor of the EarleyItem
    constructor(rule: Rule, dot: number, start: number, action: ItemAction, from: [number, number][] = []) {
        this.rule = rule;
        this.dot = dot;
        this.start = start;
        this.action = action;
        this.from = from;
    }

    // Function that compares two Earley items
    equals(item: EarleyItem) {
        return (
            this.rule.lhs === item.rule.lhs &&
            this.rule.rhs.join("") === item.rule.rhs.join("") &&
            this.dot === item.dot &&
            this.start === item.start
        );
    }

    // Function that returns a string representation of the Earley item
    toString() {
        return `${this.rule.lhs} -> ${this.rule.rhs.slice(0, this.dot).join(" ")} . ${this.rule.rhs.slice(this.dot).join(" ")} (${this.start}) - ${ItemAction[this.action]} - ${this.from.map(f => `S[${f[0]},${f[1]}]`).join(" ")}`;
    }
}