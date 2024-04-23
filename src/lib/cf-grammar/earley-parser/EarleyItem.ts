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
    // params: other: EarleyItem - the other item to compare
    //
    // returns: boolean - true if the items are equal, false otherwise
    equals(other: EarleyItem) {
        return (
            this.rule.lhs === other.rule.lhs &&
            this.rule.rhs.join("") === other.rule.rhs.join("") &&
            this.dot === other.dot &&
            this.start === other.start &&
            this.from.length === other.from.length &&
            this.from.every((f, i) => f[0] === other.from[i][0] && f[1] === other.from[i][1])
        );
    }

    // Function that compares two Earley items without the from array
    // params: other: EarleyItem - the other item to compare
    //
    // returns: boolean - true if the items are equal, false otherwise
    equalsSimple(other: EarleyItem) {
        return (
            this.rule.lhs === other.rule.lhs &&
            this.rule.rhs.join("") === other.rule.rhs.join("") &&
            this.dot === other.dot &&
            this.start === other.start
        );
    }

    // Function that returns a string representation of the Earley item
    toString() {
        return `${this.rule.lhs} -> ${this.rule.rhs.slice(0, this.dot).join(" ")} . ${this.rule.rhs.slice(this.dot).join(" ")} (${this.start}) - ${ItemAction[this.action]} - ${this.from.map(f => `S[${f[0]},${f[1]}]`).join(" ")}`;
    }
}