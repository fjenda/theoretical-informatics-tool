import {EarleyParser, Rule} from "./EarleyParser";
import {grammar_results_store} from "../../stores/graphInitStore";

export class ContextFreeGrammar {
    startSymbol: string = 'S';
    nonTerminals: string[];
    terminals: string[];
    rules: CFGRule[] = [new CFGRule('S', ['S+P', 'S-P', 'P'])];
    // rules: CFGRule[] = [new CFGRule('A', ['', 'B'])];
    parser: EarleyParser = null;
    updateRules: boolean = true;

    constructor(nonTerminals: string[], terminals: string[], rules: CFGRule[]) {
        this.nonTerminals = nonTerminals;
        this.terminals = terminals;
        this.rules.push(...rules);
        this.parser = new EarleyParser(this.startSymbol, []);
    }

    setUpdateRules(update: boolean) {
        this.updateRules = update;
    }

    convertRulesForParser(rules: CFGRule[]) {
        let newRules: Rule[] = [];
        rules.forEach(rule => {
            if (rule.rightSide.length > 0) {
                rule.rightSide.forEach((symbol, index) => {
                    newRules.push(new Rule(rule.leftSide, symbol.split('')));
                });
            } else {
                newRules.push(new Rule(rule.leftSide, []));
            }
        });

        this.parser.setRules(newRules);
        return newRules;
    }

    addRule(rule: CFGRule) {
        this.rules.push(rule);
    }

    removeRule(index: number) {
        this.rules.splice(index, 1);
    }

    updateTerminalsAndNonTerminals() {
        let splitRules = this.convertRulesForParser(this.rules);

        this.nonTerminals = splitRules.map(rule => rule.lhs);
        this.terminals = splitRules.reduce((acc, rule) => {
            rule.rhs.forEach(symbol => {
                if (this.nonTerminals.indexOf(symbol) === -1 && acc.indexOf(symbol) === -1) {
                    acc.push(symbol);
                }
            });
            return acc;
        }, []);

        // remove duplicates
        this.nonTerminals = this.nonTerminals.filter((value, index, self) => self.indexOf(value) === index);
        this.terminals = this.terminals.filter((value, index, self) => self.indexOf(value) === index);

        // console.log(this.nonTerminals, this.terminals);
    }

    toString() {
        console.log(this);
        // copy the rules to avoid modifying the original rules
        const logRules = this.rules.map(rule => new CFGRule(rule.leftSide, rule.rightSide));

        // remove rules without leftSide
        logRules.forEach((rule, index) => {
            if (rule.leftSide === '') {
                logRules.splice(index, 1);
            }
        });

        // convert empty terminals to ε
        logRules.forEach(rule => {
            rule.rightSide = rule.rightSide.map(symbol => symbol === '' ? 'ε' : symbol);
        });

        // if there are same left sides, combine the right sides
        logRules.forEach((rule, index) => {
            const sameRules = logRules.filter((r, i) => r.leftSide === rule.leftSide && i !== index);
            if (sameRules.length > 0) {
                sameRules.forEach((r, i) => {
                    rule.rightSide.push(...r.rightSide);
                    logRules.splice(logRules.indexOf(r), 1);
                });
            }
        });

//         return `G = (Π, Σ, S, P)
// Π = {${this.nonTerminals.join(', ')}},
// Σ = {${this.terminals.join(', ')}},
// S = ${this.startSymbol},
// P = {\n    ${logRules.map(rule => rule.toString()).join('\n    ')}\n}`;
        return `Π = {${this.nonTerminals.join(', ')}},
Σ = {${this.terminals.join(', ')}},
S = ${this.startSymbol},
P = {\n    ${logRules.map(rule => rule.toString()).join('\n    ')}\n}`;
    }

    validateInputs(inputs: string[][]) {
        if (this.updateRules) {
            this.convertRulesForParser(this.rules);
            this.updateRules = false;
        }

        let results: GrammarResult[] = [];
        for (let input of inputs) {
            this.parser.restart();

            let inputStr = input.join('');
            let result: { accepted: boolean; length: number; derivation: { rule: string; result: string }[][] } |
                        { accepted: boolean ;length: number; derivation: { rule: string; result: string }[] };

            if (inputStr.length === 0)
                result = this.parser.parse("");
            else
                result = this.parser.parse(inputStr);

            results.push(new GrammarResult(input, result.accepted, result.length, result.derivation));
        }

        grammar_results_store.set(results);
    }
}

export class CFGRule {
    leftSide: string;
    rightSide: string[];

    constructor(leftSide: string, rightSide: string[]) {
        this.leftSide = leftSide;
        this.rightSide = rightSide.length === 0 ? [] : rightSide;
    }

    toString() {
        return `${this.leftSide} -> ${this.rightSide.join(' | ')}`;
    }
}

export class GrammarResult {
    input: string[];
    accepted: boolean;
    length: number;
    derivation: { rule: string; result: string }[] |
                { rule: string; result: string }[][];

    constructor(input: string[], accepted: boolean, length: number, derivation: { rule: string; result: string }[][] |
                                                                                { rule: string; result: string }[])
    {
        this.input = input;
        this.accepted = accepted;
        this.length = length;
        this.derivation = derivation;
    }
}