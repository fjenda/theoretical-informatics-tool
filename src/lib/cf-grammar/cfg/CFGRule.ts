/*
    CFGRule.ts
    Class containing the grammar rule logic
    Author: Jan Fojtík
*/
export class CFGRule {
    // Left side of the rule (non-terminal)
    leftSide: string;

    // Right side of the rule (array of terminals and non-terminals)
    rightSide: string[];

    // Constructor for the CFGRule
    constructor(leftSide: string, rightSide: string[]) {
        this.leftSide = leftSide;

        // If the right side is empty, set it to an empty array
        this.rightSide = rightSide.length === 0 ? [] : rightSide;
    }

    // Function that returns a string representation of the rule
    toString() {
        return `${this.leftSide} -> ${this.rightSide.join(' | ')}`;
    }
}