import {EarleyParser, Rule} from "./EarleyParser";
import {grammar_results_store} from "../../stores/graphInitStore";

export class ContextFreeGrammar {
    startSymbol: string = 'S';
    nonTerminals: string[];
    terminals: string[];
    rules: CFGRule[] = [new CFGRule('S', ['E'])];
    parser: EarleyParser = null;
    updateRules: boolean = true;

    constructor(nonTerminals: string[], terminals: string[], rules: CFGRule[]) {
        this.nonTerminals = nonTerminals;
        this.terminals = terminals;
        this.rules.push(...rules);
        this.parser = new EarleyParser(this.startSymbol, [new Rule('S', ['E'])]);
    }

    setUpdateRules(update: boolean) {
        this.updateRules = update;
    }

    convertRulesForParser(rules: CFGRule[]) {
        let newRules: Rule[] = [];
        rules.forEach(rule => {
            if (rule.rightSide?.length > 1) {
                // convert rules with more than one symbol on the right side to multiple rules with one symbol on the right side
                rule.rightSide.forEach((symbol, index) => {
                    newRules.push(new Rule(rule.leftSide, symbol.split('')));
                });
            } else {
                newRules.push(new Rule(rule.leftSide, rule.rightSide));
            }
        });

        this.parser.setRules(newRules);
    }

    addRule(rule: CFGRule) {
        this.rules.push(rule);
    }

    removeRule(index: number) {
        this.rules.splice(index, 1);
    }

    updateTerminalsAndNonTerminals() {
        // TODO: REDO THIS
        // this.nonTerminals = this.rules.reduce((acc, rule) => {
        //     if (rule.leftSide === '') return acc;
        //
        //     if (!acc.includes(rule.leftSide)) {
        //         acc.push(rule.leftSide);
        //     }
        //     return acc;
        // }, []);
        //
        // this.terminals = this.rules.reduce((acc, rule) => {
        //     rule.rightSide.forEach(symbol => {
        //
        //         if (symbol === '') return;
        //
        //         // split the symbol into its parts
        //         const parts = symbol.split('');
        //
        //         parts.forEach(part => {
        //             // if its lowercase and not in the array, add it
        //             if (part === part.toLowerCase() && !acc.includes(part)) {
        //                 acc.push(part);
        //                 // if its uppercase and not a non-terminal and not in the array, add it
        //             } else if (part === part.toUpperCase() && !this.nonTerminals.includes(part) && !acc.includes(part)) {
        //                 acc.push(part);
        //             }
        //
        //             // ignore the others
        //         })
        //     });
        //     return acc;
        // }, []);
    }

    toString() {
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

        return `G = (Π, Σ, S, P) where
        Π = {${this.nonTerminals.join(', ')}},
        Σ = {${this.terminals.join(', ')}},
        S = ${this.startSymbol},
        P = {\n${logRules.map(rule => rule.toString()).join('\n')}\n}`;
    }

    validateInputs(inputs: string[]) {
        if (this.updateRules) {
            this.convertRulesForParser(this.rules);
            this.updateRules = false;
        }

        let results: GrammarResult[] = [];
        for (let input of inputs) {
            this.parser.restart();
            results.push(new GrammarResult(input, this.parser.parse(input)));
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
    input: string
    accepted: boolean;

    constructor(input: string, accepted: boolean) {
        this.input = input;
        this.accepted = accepted;
    }
}