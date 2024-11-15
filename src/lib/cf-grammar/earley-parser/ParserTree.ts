/*
    ParserTree.ts
    Class containing the logic for the parser tree
    This class is used after the Earley Recognizer is completed to create a tree from the Earley Items

    Author: Jan Fojtík
*/

import {Rule} from "./Rule";
import {EarleyParser} from "./EarleyParser";
import {TreeNode} from "./TreeNode";

export class ParserTree {
    root: TreeNode;

    constructor(root: TreeNode) {
        this.root = root;
    }

    // Function that returns all the leaves (using depth-first search) in the tree
    // returns: string - all the leaves in the tree
    findAllLeaves() {
        let leaves: string[] = [];
        let stack = [this.root];

        while (stack.length > 0) {
            let node = stack.pop();
            if (!node) continue;

            // if the node is a leaf and the value is a single character
            if (node.children.length === 0 && node.value.length === 1) {
                // add the value to the leaves array
                leaves.push(node.value);
            }

            // push the children of the node to the stack
            stack.push(...node.children);
        }

        // filter out the empty spaces and reverse the array
        leaves = leaves.filter((value) => value !== " ");
        return leaves.reverse().join("");
    }

    // Function that finds the derivation by traversing the tree (using depth-first search)
    // params:  parser: EarleyParser                - the parser that is used to get the nullable rules
    //
    // returns: {rule: string, result: string}[]    - the derivation of the tree
    getDerivation(parser: EarleyParser) {
        let stack = [this.root];
        let result = this.root.value;

        // array that will contain the derivation with initial Start -> root value rule
        let derivation: {rule: string, result: string}[] = [{rule: `Start → ${this.root.value}`, result: `${this.root.value}`}];

        while (stack.length > 0) {
            let node = stack.pop();
            if (!node) continue;

            // if the node is not visited and has children
            if (!node.visited) {
                if (node.children.length > 0) {
                    // parse the result with the rule of the node
                    result = this.parseChar(result, node.item.rule);
                    derivation.push({rule: `${node.item.rule.toString()}`, result: result});
                    stack.push(...node.children.reverse());
                } else if (parser.grammar.some(r => r.lhs === node.value && (r.rhs.length === 0 || (r.rhs.length == 1 && r.rhs[0] === "")))){
                    result = this.parseEpsilon(result, node.value);

                    if (result !== "err") derivation.push({rule: `${node.value} → ε`, result: result});
                }
            }

            node.visited = true;
        }

        // get nullable rules
        let nt: Rule[] = parser.grammar.filter(r => parser.nullables.includes(r.lhs) &&
            (r.rhs.length === 0 || r.rhs.every(rhs_ => parser.nullables.includes(rhs_))));

        // check if the last derivation has any non-terminals
        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < nt.length; j++) {
                if (result[i] === nt[j].lhs) {
                    // parse the result with the rule
                    result = this.parseChar(result, nt[j]);
                    derivation.push({rule: nt[j].toString(), result: result});
                    i = 0;
                    j = 0;
                }
            }
        }

        return derivation;
    }

    // Function that replaces the char in the input with the rule rhs
    // params:  input: string   - the input string
    //          rule: Rule      - the rule that is used to replace the char
    //
    // returns: string          - the input string with the replaced char
    private parseChar(input: string, rule: Rule) {
        for (let char of input) {
            if (char === rule.lhs) {
                // replace the char at index with the rule lhs
                input = input.replace(char, rule.rhs.join(""));
                break;
            }
        }

        return input;
    }

    // Function that replaces the char in the input with epsilon (it gets rid of the char)
    // params:  input: string   - the input string
    //          lhs: string     - the left side of the rule
    //
    // returns: string          - the input string with the replaced char
    //                          - or "err" if the char was not found
    private parseEpsilon(input: string, lhs: string) {
        let changed = false;
        for (let char of input) {
            if (char === lhs) {
                // replace the char at index with the rule lhs
                input = input.replace(char, "");
                changed = true;
                break;
            }
        }

        if (!changed) {
            return "err";
        }

        return input;
    }

    // Function that pretty-prints the tree
    print() {
        this.root.print(this.root, "", true);
    }
}