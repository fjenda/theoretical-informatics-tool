export class TreeNode{
    label: string;
    children: TreeNode[];

    constructor(label: string, children: TreeNode[] = []) {
        this.label = label;
        this.children = children;
    }
}