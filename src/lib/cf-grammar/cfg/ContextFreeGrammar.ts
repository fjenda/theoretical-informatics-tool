/*
    ContextFreeGrammar.ts
    Class containing the logic for CFG
    Author: Jan Fojtík
*/

import {EarleyParser} from "../earley-parser/EarleyParser";
import {Rule} from "../earley-parser/Rule";
import {CFGRule} from "./CFGRule";
import {GrammarResult} from "./GrammarResult";
import {grammar_results_store} from "../../../stores/graphInitStore";

export class ContextFreeGrammar {
    // Starting symbol of the grammar, always set to 'S'
    startSymbol: string = 'S';

    // An array of non-terminals
    nonTerminals: string[];

    // An array of terminals
    terminals: string[];

    // An array of rules with a default value
    rules: CFGRule[] = [new CFGRule('S', ['S+P', 'S-P', 'P'])];

    // An instance of earley-parser
    parser: EarleyParser = null;

    // A boolean to check if the rules need updating for the parser
    updateRules: boolean = true;

    // Constructor for the CFG
    constructor(nonTerminals: string[], terminals: string[], rules: CFGRule[]) {
        this.nonTerminals = nonTerminals;
        this.terminals = terminals;
        this.rules.push(...rules);
        this.parser = new EarleyParser(this.startSymbol, []);
    }

    // Setter for the updateRules variable
    setUpdateRules(update: boolean) {
        this.updateRules = update;
    }

    // Function to convert the rules for the parser
    // (splitting the right side of the rules into individual symbols and
    // splitting the rules with multiple right sides into multiple rules)
    // params: rules: CFGRule[]     - an array of rules
    // returns: Rule[]              - an array of the newly constructed rules for the parser
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

        // set the rules in the parser
        this.parser.setRules(newRules);
        return newRules;
    }

    // Function to add a rule to the rules array
    // params: rule: CFGRule - the rule to be added
    addRule(rule: CFGRule) {
        this.rules.push(rule);
    }

    // Function to remove a rule from the rules array
    // params: index: number - the index of the rule to be removed
    removeRule(index: number) {
        this.rules.splice(index, 1);
    }

    // Function to update the non-terminals and terminals arrays
    updateTerminalsAndNonTerminals() {
        // get the rules for the parser since its easier to get the non-terminals and terminals from there
        let splitRules = this.convertRulesForParser(this.rules);

        // get all the non-terminals from the lhs of the rules
        this.nonTerminals = splitRules.map(rule => rule.lhs);

        // get all the terminals from the rhs of the rules
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
    }

    //  Function that returns a string representation of the grammar
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
        return `Π: {${this.nonTerminals.join(', ')}},
Σ: {${this.terminals.join(', ')}},
S: ${this.startSymbol},
P: {\n    ${logRules.map(rule => rule.toString()).join('\n    ')}\n}`;
    }

    // Function to validate the inputs
    // params: inputs: string[][] - an array of strings to be validated
    validateInputs(inputs: string[][]) {
        // check if the rules in the parser need to be updated
        if (this.updateRules) {
            this.convertRulesForParser(this.rules);
            this.updateRules = false;
        }

        // create an array to store the results
        let results: GrammarResult[] = [];

        // loop through the inputs and parse them
        for (let input of inputs) {
            // restart the parser for each input
            this.parser.restart();

            let inputStr = input.join('');
            let result: { accepted: boolean; length: number; derivation: { rule: string; result: string }[][] } |
                        { accepted: boolean; length: number; derivation: { rule: string; result: string }[] };

            // parsing of the input
            if (inputStr.length === 0)
                result = this.parser.parse("");
            else
                result = this.parser.parse(inputStr);

            // store the result
            results.push(new GrammarResult(input, result.accepted, result.length, result.derivation));
        }

        // store the results in the store
        grammar_results_store.set(results);
    }
}



