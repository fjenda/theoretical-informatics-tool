/*
    Converter.ts
    Class for converting a context-free grammar to PDA
    Author: Jan Fojtík
*/

import {ContextFreeGrammar} from "./ContextFreeGrammar";
import {CFGRule} from "./CFGRule";
import {pda_graph_store} from "../../../stores/graphInitStore";
import type {TransitionType} from "../../../types/pda-cfg/TransitionType";

export class Converter {
    // Context-free grammar to be converted
    grammar: ContextFreeGrammar;

    // Dictionary for renaming non-terminals
    nonTerminalsDict: { [key: string]: string } = {};

    // Constructor for the converter
    constructor(grammar: ContextFreeGrammar) {
        this.grammar = grammar;
    }

    // Function that splits the rules with more than one production
    private splitRules() {
        let newRules: CFGRule[] = [];

        // rule loop
        this.grammar.rules.forEach(rule => {

            // if the rule has 1 or more productions push them into the new array as separate rules
            if (rule.rightSide.length > 0) {
                rule.rightSide.forEach((symbol, index) => {
                    newRules.push(new CFGRule(rule.leftSide, symbol.split('')));
                });
            } else { // if the rule has no productions push an empty array instead
                newRules.push(new CFGRule(rule.leftSide, []));
            }
        });

        // update the rules
        this.grammar.rules = newRules;
    }


    // Function that renames non-terminals to A0, A1, ...
    // This is then used for removing the recursion
    private renameNonTerminals() {
        // rule loop
        this.grammar.rules.forEach(rule => {
            // if the left side of the rule is not in the dictionary, add it
            this.nonTerminalsDict[rule.leftSide] = this.nonTerminalsDict[rule.leftSide] || `A${Object.keys(this.nonTerminalsDict).length}`;

            // loop through the right side of the rule
            rule.rightSide.forEach((symbol) => {
                // if empty, skip it
                if (symbol === '') return;

                // if the symbol is not a non-terminal, skip it
                if (!this.grammar.nonTerminals.includes(symbol)) return;

                // if the symbol is not in the dictionary, add it
                this.nonTerminalsDict[symbol] = this.nonTerminalsDict[symbol] || `A${Object.keys(this.nonTerminalsDict).length}`;
            });
        });
    }

    // Function that removes the recursion from the grammar
    private removeRecursion() {
        // loop through the non-terminals
        for (let i = 0; i < Object.keys(this.nonTerminalsDict).length; i++) {
            for (let j = 0; j < i; j++) {
                // get rules for Ai -> Aj
                let rules = this.grammar.rules.filter(rule => rule.leftSide === Object.keys(this.nonTerminalsDict)[i] &&
                    rule.rightSide[0] === Object.keys(this.nonTerminalsDict)[j]);

                // loop through the rules
                for (let rule of rules) {
                    // get rules for Aj
                    let jRules = this.grammar.rules.filter(r => r.leftSide === Object.keys(this.nonTerminalsDict)[j]);

                    // remove the recursive rule
                    this.grammar.rules = this.grammar.rules.filter(r => r !== rule);

                    // add the new rules with substitution
                    let newRHS = rule.rightSide.slice(1);

                    jRules.forEach(r => {
                        // create the new rule
                        let newRule = new CFGRule(rule.leftSide, r.rightSide.concat(newRHS));
                        this.grammar.rules.push(newRule);
                    });
                }
            }

            // remove direct recursion
            if (this.isDirectlyRecursive(Object.keys(this.nonTerminalsDict)[i])) {
                let nonTerminal = Object.keys(this.nonTerminalsDict)[i];

                // create the new non-terminal
                let newNonTerminal = `${nonTerminal}'`;

                // create two arrays of rules, one with recursion and one without
                let withoutRecursion = this.grammar.rules.filter(rule => rule.leftSide === nonTerminal && rule.rightSide[0] !== nonTerminal);
                let withRecursion = this.grammar.rules.filter(rule => rule.leftSide === nonTerminal && rule.rightSide[0] === nonTerminal);

                // loop through the rules with recursion
                for (let recursive of withRecursion) {
                    // remove it from the grammar
                    this.grammar.rules = this.grammar.rules.filter(rule => rule !== recursive);

                    // remove the non-terminal from the front and add the new one to the back
                    recursive.rightSide = recursive.rightSide.slice(1);
                    recursive.rightSide.push(newNonTerminal);
                    recursive.leftSide = newNonTerminal;

                    // add the new rule if not added already
                    if (!this.grammar.rules.some(rule => rule === recursive)) {
                        this.grammar.rules.push(recursive);
                    }

                    // add the new non-terminal if not added already
                    if (!this.grammar.nonTerminals.includes(newNonTerminal))
                        this.grammar.nonTerminals.push(newNonTerminal);
                }

                // add the nonRecursive rules with the new non-terminal to the end
                withoutRecursion.forEach(rule => {
                    rule.rightSide.push(newNonTerminal);

                    if (!this.grammar.rules.some(r => r === rule))
                        this.grammar.rules.push(rule);
                });

                // if not present add the new non-terminal with ε production
                if (!this.grammar.rules.some(rule => rule.leftSide === newNonTerminal && rule.rightSide[0] === '')) {
                    this.grammar.rules.push(new CFGRule(newNonTerminal, []));
                }
            }
        }
    }

    // Function that checks if the non-terminal is directly recursive
    // params: nonTerminal: string - the non-terminal to check
    // returns: boolean - true if the non-terminal is directly recursive, false otherwise
    private isDirectlyRecursive(nonTerminal: string) {
        return this.grammar.rules.some(rule => rule.leftSide === nonTerminal && rule.rightSide[0] === nonTerminal);
    }

    // Function that converts the grammar to PDA
    // returns: TransitionMeta[] - the transitions of the PDA
    convertToPDA() {
        // split the rules
        this.splitRules();

        // rename the non-terminals
        this.renameNonTerminals();

        // remove the recursion
        this.removeRecursion();

        let transitions: TransitionType[] = [];
        let state = 'q';

        // PDA rule creation

        // loop through the rules
        this.grammar.rules.forEach(rule => {
            // if the right side is empty, add ε
            if (rule.rightSide.length === 0) rule.rightSide.push('ε');

            // add the transitions for each rule
            // ex.
            // A -> b into (q, ε, A) = {(q, b)}
            transitions.push({
                state: state,
                input: "ε",
                stack: rule.leftSide,
                stateAfter: state,
                stackAfter: rule.rightSide
            });
        });

        // add the transitions for the terminals
        this.grammar.terminals.forEach(terminal => {
            // ex.
            // for terminal a
            // (q, a, a) = {(q, ε)}
            transitions.push({
                state: state,
                input: terminal,
                stack: terminal,
                stateAfter: state,
                stackAfter: ['ε']
            });
        });

        // update the graph store
        pda_graph_store.update((n) => {
            n.transitions = transitions;
            n.startState = state;
            n.finalStates = [state];
            n.nodes = [{id: state, label: state}];
            n.stackBottom = this.grammar.startSymbol;
            return n;
        });

        // return the transitions
        return transitions;
    }

    // Function that sets the grammar to be converted
    // params: grammar: ContextFreeGrammar - the grammar to be converted
    setGrammar(grammar: ContextFreeGrammar) {
        this.grammar = grammar;
    }
}