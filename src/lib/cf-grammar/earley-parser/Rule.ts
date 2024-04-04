/*
    Rule.ts
    A class that represents a rule in a context-free grammar.
    This class is used in the Earley parser to represent rules in the grammar.

    Author: Jan Fojtík
*/
export class Rule {
    // The left-hand side of the rule
    lhs: string;

    // The right-hand side of the rule
    rhs: string[];

    // Constructor for the rule
    constructor(lhs: string, rhs: string[]) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    // Function that compares two rules
    equals(other: Rule) {
        return this.lhs === other.lhs && this.rhs.join("") === other.rhs.join("");
    }

    // Function that returns a string representation of the rule
    toString() {
        let right = this.rhs.join("");
        return `${this.lhs} → ${right.length === 0 ? 'ε' : right}`;
    }
}
