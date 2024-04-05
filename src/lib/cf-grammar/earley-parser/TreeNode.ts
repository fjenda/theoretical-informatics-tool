/*
    TreeNode.ts
    Part of ParserTree
    Class containing the logic for the parser tree node

    Author: Jan Fojtík
*/

import {EarleyItem} from "./EarleyItem";

export class TreeNode {
    // Value of the node
    value: string;

    // Children of the node
    children: TreeNode[] = [];

    // Boolean to check if the node was visited
    visited: boolean;

    // EarleyItem that the node is associated with
    item: EarleyItem = {} as EarleyItem;

    // Constructor for the node
    constructor(value: string) {
        this.value = value;
        this.children = [];
        this.visited = false;
    }

    // Setter for the item variable
    setItem(item: EarleyItem) {
        this.item = item;
    }

    // Function to add a child to the node
    addChild(child: TreeNode) {
        this.children.push(child);
    }

    // Recursive function to pretty-print the whole tree from this node
    print(node: TreeNode, indent: string, last: boolean) {
        console.log(indent + (last ? "└─" : "├─") + node.value);
        indent += last ? "  " : "│ ";

        for (let i = 0; i < node.children.length; i++) {
            this.print(node.children[i], indent, i === node.children.length - 1);
        }
    }
}