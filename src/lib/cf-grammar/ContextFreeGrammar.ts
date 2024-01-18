export class ContextFreeGrammar {
    startSymbol: string;
    nonTerminals: string[];
    terminals: string[];
    rules: CFGRule[];

    constructor(startSymbol: string, nonTerminals: string[], terminals: string[], rules: CFGRule[]) {
        this.startSymbol = startSymbol;
        this.nonTerminals = nonTerminals;
        this.terminals = terminals;
        this.rules = rules;
    }
}

export class CFGRule {
    leftSide: string;
    rightSide: string[];

    constructor(leftSide: string, rightSide: string[]) {
        this.leftSide = leftSide;
        this.rightSide = rightSide;
    }
}