import { ContextFreeGrammar, CFGRule } from "./ContextFreeGrammar";
import type {TransitionMeta} from "../../types/TransitionMeta";
import {graph_store} from "../../stores/graphInitStore";
export class Converter {
    grammar: ContextFreeGrammar;
    added: number = 0;
    nullables: CFGRule[] = [];
    nonTerminalsDict: { [key: string]: string } = {};

    constructor(grammar: ContextFreeGrammar) {
        this.grammar = grammar;
    }

    // eliminate start symbol from RHS.
    // create a new production as: $->S where $ is the new start symbol.
    private eliminateStartSymbol() {
        let res: boolean = false;
        let eps: boolean = false;

        // check if the start symbol is on RHS
        this.grammar.rules.forEach((rule) => {
            if (rule.rightSide.includes(this.grammar.startSymbol)) {
                res = true;
            }

            if (rule.rightSide.length === 0 && rule.leftSide === this.grammar.startSymbol) {
                this.grammar.rules = this.grammar.rules.filter((r) => r !== rule);
                this.nullables.push(rule);
                eps = true;
            }
        });

        if (!res) return;

        let newStartSymbol = '$';
        let productions = [this.grammar.startSymbol];

        // Add new production to the start of the array
        this.grammar.rules.unshift(new CFGRule(newStartSymbol, [this.grammar.startSymbol]));

        if (eps) this.grammar.rules.unshift(new CFGRule(newStartSymbol, []));

        this.grammar.startSymbol = newStartSymbol;
        this.grammar.nonTerminals.unshift(newStartSymbol);
    }

    // eliminate null productions
    private eliminateNullProductions() {
        // find direct nullables
        this.nullables.push(...this.grammar.rules.filter((rule) => rule.rightSide.length === 0));

        let sizeBefore = 0;
        while (sizeBefore !== this.nullables.length) {
            sizeBefore = this.nullables.length;
            // find nullables in the right side
            this.grammar.rules.filter((rule) => {
                // if the production is made of nullables
                if (rule.rightSide.every((symbol) => this.nullables.some((nullable) => nullable.leftSide === symbol))) {
                    if (!this.nullables.includes(rule)) this.nullables.push(rule);
                }
            });
        }

        this.grammar.rules.forEach((rule) => {
            // remove empty productions
            if (rule.leftSide !== this.grammar.startSymbol && rule.rightSide.length === 0)
                this.grammar.rules = this.grammar.rules.filter((r) => r !== rule);

            // generate all combinations of the production and push it to the right side
            if (!this.nullables.some((nullable) => rule.rightSide.includes(nullable.leftSide))) return;

            // remove the current rule
            this.grammar.rules = this.grammar.rules.filter((r) => r !== rule);

            this.generateCombinations(rule.rightSide, this.nullables).forEach((combination) => {
                this.grammar.rules.push(new CFGRule(rule.leftSide, combination));
            });
        });
    }

    private generateCombinations(production: string[], nullables: CFGRule[]): string[][] {
        const nonTerminals: string[][] = [];
        let currentCombination: string[] = [];

        // create a copy of production
        let originalProduction = production.slice();

        // identify consecutive nullable non-terminals
        for (let i = 0; i <= production.length; i++) {
            if (i !== production.length && nullables.some((nullable) => nullable.leftSide === production[i])){
                currentCombination.push(production[i]);
            } else {
                if (currentCombination.length >= 1) {
                    nonTerminals.push(currentCombination);
                }
                currentCombination = [];
            }
        }

        // generate combinations of non-terminals
        let parts: string[][][] = [];
        nonTerminals.forEach((part) => {
            const combinations: string[][] = [];

            // generate all combinations of consecutive non-terminals
            for (let i = 0; i < part.length; i++) {
                // push the single non-terminal (A, B, C, etc.)
                if (!combinations.some(comb => comb.every(symbol => symbol === part[i]))) {
                    combinations.push([part[i]])
                }

                if (part.length === 1) continue;

                // push the combination without the current non-terminal (AB, AC, BC, etc.)
                let combination = part.slice();
                combination.splice(i, 1);
                if (!combinations.some(comb => comb.every((symbol, index) => (comb.length === combination.length && symbol === combination[index])))) {
                    combinations.push(combination);
                }
            }

            // push the whole non-terminal (ABC, etc.)
            if (!combinations.some(comb => comb.every((symbol, index) => (comb.length === part.length && symbol === part[index])))) {
                combinations.push(part);
            }

            parts.push(combinations);
        });


        // add the remaining terminals

        // firstly we copy the original production into a new variable
        let newProduction = production;

        // then we remove the non-terminals from the production
        this.nullables.forEach((nullable) => {
            newProduction.forEach((symbol, index) => {
                if (symbol === nullable.leftSide) newProduction[index] = '?';
            });
        });

        // merge the consecutive ? into one without using join
        let tmp: string[] = [];
        let last = '';
        newProduction.forEach((symbol) => {
            if (symbol === '?' && last === '?') return;
            tmp.push(symbol);
            last = symbol;
        });

        newProduction = tmp;
        let finalProductions: string[][] = [];
        // then we add the new combinations to the production

        // find the number of ?
        const count = (newProduction.join("").match(/\?/g) || []).length;

        // find all the indices of ?
        let indices: number[] = [];
        for (let i = 0; i < newProduction.length; i++) {
            if (newProduction[i] === '?') indices.push(i);
        }

        // production without the terminals
        let tmpProduction = newProduction.filter((symbol) => symbol !== '?');

        if (count === 1) {
            parts.forEach((part) => {
                part.forEach((p) => {
                    let filledProduction = newProduction.slice();
                    filledProduction.splice(indices[0], 1, ...p);

                    // push a copy of the new production
                    finalProductions.push([...filledProduction]);
                });
            });
        } else if (count === 0) {
            finalProductions.push(newProduction);
        } else { // we need to generate combinations of the combinations
            const combinations = this.generateCombinationsRecursive(originalProduction, nullables);

            // push the combinations to the final productions
            finalProductions.push(...combinations);
        }

        // if the production has terminals
        if (tmpProduction.length !== 0 && !finalProductions.some((prod) => prod.join('') === tmpProduction.join('')))
            finalProductions.push(tmpProduction);

        return finalProductions;
    }

    private generateCombinationsRecursive(parts: string[], nullables: CFGRule[]) {
        const combinations: string[][] = [];

        // recursively generate combinations
        function generate(currentCombination: string[], index: number) {
            if (index === parts.length) {
                combinations.push(currentCombination); // pushing a copy of the current combination to avoid mutations
                return;
            }

            const currentSymbol = parts[index];
            if (nullables.some(nullable => nullable.leftSide === currentSymbol)) {
                // try two options: with the nullable non-terminal and without it
                generate([...currentCombination, currentSymbol], index + 1);
                generate([...currentCombination], index + 1); // without the nullable non-terminal
            } else {
                // continue with the current symbol
                generate([...currentCombination, currentSymbol], index + 1);
            }
        }

        // start generation with an empty combination at index 0
        generate([], 0);

        return combinations;
    }

    // eliminate unit productions
    private eliminateUnitProductions() {
        let newGrammar: CFGRule[] = [];
        let unitProduction: CFGRule[] = [];

        // find all unit productions
        this.grammar.rules.forEach((rule) => {
            if (rule.rightSide.length === 1 && this.grammar.nonTerminals.includes(rule.rightSide[0])) {
                unitProduction.push(new CFGRule(rule.leftSide, rule.rightSide));
            } else {
                // if the production is not a unit production, push it to the new grammar
                newGrammar.push(new CFGRule(rule.leftSide, rule.rightSide));
            }
        });

        // Now we find all the variables that satisfy ‘X *=> Z’.
        // For ‘X *=> Z’ , we add ‘X -> z’ because ‘Z -> z’ exists in the new grammar.

        // find all the variables that satisfy X *=> Z
        unitProduction.reverse().forEach((rule) => {
            let leftSide = rule.leftSide;
            let rightSide = rule.rightSide[0];

            let rules = newGrammar.filter((r) => r.leftSide === rightSide);

            // add the rules to the new grammar
            rules.forEach((r) => {
                newGrammar.push(new CFGRule(leftSide, r.rightSide));
            });
        });

        // remove duplicate rules
        const uniqueRules: Set<string> = new Set();
        newGrammar.forEach((rule) => {
            const strRepresentation = rule.toString();
            if (!uniqueRules.has(strRepresentation)) {
                uniqueRules.add(strRepresentation);
            }
        });

        // sort the rules by priority from non-terminals array
        newGrammar = newGrammar.sort((a, b) => {
            return this.grammar.nonTerminals.indexOf(a.leftSide) - this.grammar.nonTerminals.indexOf(b.leftSide);
        });

        // this.grammar.rules = mergedGrammar;
        this.grammar.rules = newGrammar;

        // order the rules by the lhs
        this.grammar.rules = this.grammar.rules.sort((a, b) => {
            return this.grammar.nonTerminals.indexOf(a.leftSide) - this.grammar.nonTerminals.indexOf(b.leftSide);
        });
    }

    // eliminate useless productions
    private eliminateUselessProductions() {
        // first remove the non-terminals that are not reachable from any rules
        let reachableNonTerminals: string[] = [this.grammar.startSymbol];

        // find the reachable non-terminals
        this.grammar.nonTerminals.forEach((nonTerminal) => {
            this.grammar.rules.forEach((rule) => {
                if (rule.rightSide.some(s => s.includes(nonTerminal)) && !reachableNonTerminals.includes(nonTerminal)) {
                    reachableNonTerminals.push(nonTerminal);
                }
            });
        });

        // remove the unreachable non-terminals
        this.grammar.nonTerminals = this.grammar.nonTerminals.filter((nonTerminal) => reachableNonTerminals.includes(nonTerminal));
        this.grammar.rules = this.grammar.rules.filter((rule) => reachableNonTerminals.includes(rule.leftSide));
    }

    private prepareForChomsky() {
        this.eliminateStartSymbol();

        this.eliminateNullProductions();

        this.eliminateUnitProductions();

        this.eliminateUselessProductions();

        // split the rules with more productions
        const newRules: CFGRule[] = [];
        this.grammar.rules.forEach(rule => {
            rule.rightSide.forEach(production => {
                newRules.push(new CFGRule(rule.leftSide, production.split('')));
            });
        });

        this.grammar.rules = newRules;
        this.convertToChomsky();
    }

    convertToChomsky() {
        let newRules: CFGRule[] = [];
        for (let rule of this.grammar.rules) { // for each A -> α
            if ((rule.rightSide.length === 1 && this.grammar.terminals.includes(rule.rightSide[0])) ||
                (rule.rightSide.length === 2 && this.grammar.nonTerminals.includes(rule.rightSide[0]) && this.grammar.nonTerminals.includes(rule.rightSide[1])) ||
                (rule.rightSide.length === 0 && rule.leftSide === this.grammar.startSymbol)) {
                // if α is 1 terminal, or 2 non-terminals, or ε and A is the start symbol

                // push them into the new grammar
                newRules.push(rule);

                // continue to next rule
                continue;
            }

            for (let i = 0; i < rule.rightSide.length; i++) {
                if (this.grammar.nonTerminals.includes(rule.rightSide[i])) {
                    continue;
                } else if (this.grammar.terminals.includes(rule.rightSide[i])) {
                    let found = false;
                    let foundNonTerminal = '';
                    // check if a rule with the terminal exists
                    for (let r of newRules) {
                        if (r.rightSide.join('') === rule.rightSide[i]) {
                            found = true;
                            foundNonTerminal = r.leftSide;
                            break;
                        }
                    }

                    if (!found) {
                        const newNonTerminal = `N${rule.rightSide[i]}`;
                        this.grammar.nonTerminals.push(newNonTerminal);
                        newRules.push(new CFGRule(newNonTerminal, [rule.rightSide[i]]));
                        rule.rightSide[i] = rule.rightSide[i].replace(rule.rightSide[i], newNonTerminal);
                    } else {
                        rule.rightSide[i] = rule.rightSide[i].replace(rule.rightSide[i], foundNonTerminal);
                    }
                }
            }

            if (rule.rightSide.length === 2) { // the rule is in CNF, add it
                newRules.push(rule);
                continue;
            }

            let newNonTerminal = `H${this.added++}`;
            this.grammar.nonTerminals.push(newNonTerminal);

            let newRightSide = [rule.rightSide[0], newNonTerminal];
            let newRule = new CFGRule(rule.leftSide, newRightSide);
            newRules.push(newRule);

            if (rule.rightSide.length <= 3) {
                // 2 last items in rule.rightSide
                newRightSide = rule.rightSide.slice(-2, rule.rightSide.length);
                newRule = new CFGRule(newNonTerminal, newRightSide);
                newRules.push(newRule);
            } else {
                let lastNonTerminal = newNonTerminal;
                for (let i = 1; i < rule.rightSide.length - 2; i++) {
                    newNonTerminal = `H${this.added++}`;
                    this.grammar.nonTerminals.push(newNonTerminal);

                    newRightSide = [rule.rightSide[i], newNonTerminal];
                    newRule = new CFGRule(lastNonTerminal, newRightSide);
                    newRules.push(newRule);
                    lastNonTerminal = newNonTerminal;
                }
                newRightSide = rule.rightSide.slice(-2, rule.rightSide.length);
                newRule = new CFGRule(lastNonTerminal, newRightSide);
                newRules.push(newRule);
            }
        }

        // for every terminal in the grammar, add a rule to the new grammar
        for (let terminal of this.grammar.terminals) {
            let found = false;
            let foundNonTerminal = '';

            for (let rule of newRules) {
                if (rule.rightSide.join('') === terminal) {
                    found = true;
                    foundNonTerminal = rule.leftSide;
                    break;
                }
            }

            if (found) continue;

            const newNonTerminal = `N${terminal}`;
            this.grammar.nonTerminals.push(newNonTerminal);

            newRules.push(new CFGRule(newNonTerminal, [terminal]));
        }

        // merge the rules with the same left side
        let mergedGrammar: CFGRule[] = [];
        newRules.forEach((rule) => {
            let leftSide = rule.leftSide;

            // find all the rules with the same left side
            let rules = newRules.filter((r) => r.leftSide === leftSide);

            // remove the rules from the new grammar
            rules.forEach((r) => {
                newRules = newRules.filter((rule) => rule !== r);
            });

            // merge the right sides
            let mergedRightSide: string[] = [];
            rules.forEach((r) => {
                mergedRightSide.push(r.rightSide.join(''));
            });

            // remove duplicate symbols
            mergedRightSide = mergedRightSide.filter((symbol, index) => mergedRightSide.indexOf(symbol) === index);


            if (mergedRightSide.length === 0) return;

            // add the merged rule to the merged grammar
            mergedGrammar.push(new CFGRule(leftSide, mergedRightSide));
        });

        // sort by non-terminals
        mergedGrammar = mergedGrammar.sort((a, b) => {
            return this.grammar.nonTerminals.indexOf(a.leftSide) - this.grammar.nonTerminals.indexOf(b.leftSide);
        });
    }

    // splits rules with more than 1 production
    private splitRules() {
        let newRules: CFGRule[] = [];
        this.grammar.rules.forEach(rule => {
            if (rule.rightSide.length > 0) {
                rule.rightSide.forEach((symbol, index) => {
                    newRules.push(new CFGRule(rule.leftSide, symbol.split('')));
                });
            } else {
                newRules.push(new CFGRule(rule.leftSide, []));
            }
        });

        this.grammar.rules = newRules;
    }

    private renameNonTerminals() {
        this.grammar.rules.forEach(rule => {
            this.nonTerminalsDict[rule.leftSide] = this.nonTerminalsDict[rule.leftSide] || `A${Object.keys(this.nonTerminalsDict).length}`;

            rule.rightSide.forEach((symbol) => {
                if (symbol === '') return;
                if (!this.grammar.nonTerminals.includes(symbol)) return;

                this.nonTerminalsDict[symbol] = this.nonTerminalsDict[symbol] || `A${Object.keys(this.nonTerminalsDict).length}`;
            });
        });
    }

    convertToOwnGrammar() {
        this.eliminateStartSymbol();

        this.eliminateNullProductions();

        this.eliminateUnitProductions();

        this.eliminateUselessProductions();
    }

    private removeRecursion() {
        for (let i = 0; i < Object.keys(this.nonTerminalsDict).length; i++) {
            for (let j = 0; j < i; j++) {
                let rules = this.grammar.rules.filter(rule => rule.leftSide === Object.keys(this.nonTerminalsDict)[i] &&
                    rule.rightSide[0] === Object.keys(this.nonTerminalsDict)[j]);

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

                let withoutRecursion = this.grammar.rules.filter(rule => rule.leftSide === nonTerminal && rule.rightSide[0] !== nonTerminal);
                let withRecursion = this.grammar.rules.filter(rule => rule.leftSide === nonTerminal && rule.rightSide[0] === nonTerminal);

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

    private isDirectlyRecursive(nonTerminal: string) {
        return this.grammar.rules.some(rule => rule.leftSide === nonTerminal && rule.rightSide[0] === nonTerminal);
    }

    private greibachConversion() {
        let exists = true;
        while (exists) {
            for (let rule of this.grammar.rules) {
                if (rule.rightSide.length === 0) continue;

                // if the first symbol is a non-terminal
                if (this.grammar.nonTerminals.includes(rule.rightSide[0])) {
                    // find all the rules for the non-terminal
                    let rules = this.grammar.rules.filter(r => r.leftSide === rule.rightSide[0] && r.rightSide.length >= 1);

                    // remove the current rule from the grammar
                    this.grammar.rules = this.grammar.rules.filter(r => r !== rule);

                    // add the new rules with the substitution to the grammar
                    rules.forEach(r => {
                        this.grammar.rules.push(new CFGRule(rule.leftSide, r.rightSide.concat(rule.rightSide.slice(1))));
                    });
                }
            }

            // check if theres a rule starting with non-terminal
            exists = this.grammar.rules.some(rule => rule.rightSide.length >= 1 && this.grammar.nonTerminals.includes(rule.rightSide[0]));
        }

        // sort the grammar
        this.grammar.rules = this.grammar.rules.sort((a, b) => {
            return this.grammar.nonTerminals.indexOf(a.leftSide) - this.grammar.nonTerminals.indexOf(b.leftSide);
        });

        // now all the right sides start with a terminal
        for (let rule of this.grammar.rules) {
            // if the production is only 1 terminal, continue
            if (rule.rightSide.length === 1 && this.grammar.terminals.includes(rule.rightSide[0])) continue;

            // if the rule is the START -> ε, continue
            if (rule.leftSide === this.grammar.startSymbol && rule.rightSide.length === 0) continue;

            // let right side = x1x2..xk in (T U N), 1 <= i <= k
            for (let i = 1; i < rule.rightSide.length; i++) {
                // if the symbol is a non-terminal, continue
                if (this.grammar.nonTerminals.includes(rule.rightSide[i])) continue;

                // if the symbol is a terminal, and there isnt a non-terminal that only generates it, create one and replace it in the production
                let found = false;
                let foundNonTerminal = '';
                for (let r of this.grammar.rules) {
                    if (r.rightSide.length === 1 && r.rightSide[0] === rule.rightSide[i]) {
                        // check if the grammar doesnt contain the rule producing other symbols
                        let all = this.grammar.rules.filter(ru => ru.leftSide === r.leftSide);

                        if (all !== undefined && all.length !== 1) continue;

                        found = true;
                        foundNonTerminal = r.leftSide;
                        break;
                    }
                }

                if (!found) {
                    const newNonTerminal = `N${rule.rightSide[i]}`;
                    this.grammar.nonTerminals.push(newNonTerminal);
                    this.grammar.rules.push(new CFGRule(newNonTerminal, [rule.rightSide[i]]));
                    rule.rightSide[i] = newNonTerminal;
                } else {
                    rule.rightSide[i] = foundNonTerminal;
                }
            }
        }

        // now for each terminal in the grammar, if the rule doesnt exist, add it
        for (let terminal of this.grammar.terminals) {
            // first check if it needs a non-terminal
            // that means if there is a production that doesnt only generate the terminal and the terminal isnt first in the production
            let needsNonTerminal = this.grammar.rules.some(rule => rule.rightSide.length > 1 &&
                    rule.rightSide.includes(terminal)) &&
                !this.grammar.rules.some(rule => rule.rightSide.length === 1 && rule.rightSide[0] === terminal);
            if (!needsNonTerminal) continue;

            let found = false;
            let foundNonTerminal = '';

            for (let rule of this.grammar.rules) {
                if (rule.rightSide.length === 1 && rule.rightSide[0] === terminal) {
                    let all = this.grammar.rules.filter(ru => ru.leftSide === rule.leftSide);

                    if (all !== undefined && all.length !== 1) continue;

                    found = true;
                    foundNonTerminal = rule.leftSide;
                    break;
                }
            }

            if (found) continue;

            const newNonTerminal = `N${terminal}`;
            this.grammar.nonTerminals.push(newNonTerminal);
            this.grammar.rules.push(new CFGRule(newNonTerminal, [terminal]));
        }
    }

    convertToGreibach() {
        // splitting rules with more productions
        this.splitRules();

        this.renameNonTerminals();

        // recursion removal
        this.removeRecursion();

        // own grammar conversion
        this.convertToOwnGrammar();

        // greibach conversion
        this.greibachConversion();
    }

    convertToPDA() {
        this.splitRules();

        this.renameNonTerminals();

        this.removeRecursion();

        let transitions: TransitionMeta[] = [];
        let rules: string[] = [];
        let state = 'q';

        // create the rules
        this.grammar.rules.forEach(rule => {
            if (rule.rightSide.length === 0) rule.rightSide.push('ε');

            transitions.push({
                state: state,
                input: "ε",
                stack: rule.leftSide,
                stateAfter: state,
                stackAfter: rule.rightSide
            });

            rules.push(`d(${state},ε,${rule.leftSide})=(${state},${rule.rightSide.join(' ')});`);
        });

        this.grammar.terminals.forEach(terminal => {
            transitions.push({
                state: state,
                input: terminal,
                stack: terminal,
                stateAfter: state,
                stackAfter: ['ε']
            });

            rules.push(`d(${state},${terminal},${terminal})=(${state},ε);`);
        });

        graph_store.update((n) => {
            n.transitions = transitions;
            n.startState = state;
            n.finishState = [state];
            n.nodes = [{id: state, label: state}];
            n.stackBottom = this.grammar.startSymbol;
            return n;
        });

        rules.forEach(rule => {
            console.log(rule);
        });

        return transitions;
    }

    setGrammar(grammar: ContextFreeGrammar) {
        this.grammar = grammar;
    }
}

const grammar = [
    new CFGRule("S", ["ASB"]),
    new CFGRule("A", ["aAS", "a", ""]),
    new CFGRule("B", ["SbS", "A", "bb"]),
];

/*
S → A | 0SA | ε
A → 1A | 1 | B1
B → 0B | 0 | 0SBA
*/

const grammar2 = [
    new CFGRule("S", ["A", "0SA", ""]),
    new CFGRule("A", ["1A", "1", "B1"]),
    new CFGRule("B", ["0B", "0", "0SBA"]),
];

const grammar3 = [
    new CFGRule("S", ["BC"]),
    new CFGRule("B", ["CC", "bS"]),
    new CFGRule("C", ["cC", ""]),
]

/*
S → S + E | E
E → (S) | i
*/

const grammar4 = [
    new CFGRule("S", ["S+E", "E"]),
    new CFGRule("E", ["(S)", "i"]),
]

//S ⇒ S a | S b | c | d

const grammar5 = [
    new CFGRule("S", ["Sa", "Sb", "c", "d"]),
]


// S -> ABCd
// A -> BC
// B -> bB | ?
// C -> cC | ?
const grammar6 = [
    new CFGRule("S", ["ABCd"]),
    new CFGRule("A", ["BC"]),
    new CFGRule("B", ["bB", ""]),
    new CFGRule("C", ["cC", ""]),
]