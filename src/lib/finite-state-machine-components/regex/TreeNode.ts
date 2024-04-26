/*
    FiniteStateAutomaton.ts
    Class for tree node used in regex tree

    Author: Marek Krúpa
*/

export class TreeNode{
    //properties
    label: string;
    children: TreeNode[];

    //constructor
    constructor(label: string, children: TreeNode[] = []) {
        this.label = label;
        this.children = children;
    }
}