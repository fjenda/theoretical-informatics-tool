import {graph_store} from "../../../stores/graphInitStore";
import type {TransitionMeta} from "../../../types/TransitionMeta";
import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
import {TreeNode} from "./TreeNode";

export class  RegexAutomaton{

    finAut : FiniteStateAutomaton;
    regex : string;
    position : number;
    constructor(regex : string){
        this.regex = regex;
        this.position = 0;
        this.finAut = new FiniteStateAutomaton();
    };

    getAlphabet() : string[] {
        let alphabet = this.regex.split("");
        return alphabet;
    }

    regexProcessFunc() : TransitionMeta[] | null {
        const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
            { state: this.finAut.startState, index: 0, path: [] },
        ];

        let alphabet = this.regex.split("");

        let tree = this.parse();
        console.log(tree);

        return null;
    }

    peek() : string | null {
        if (this.position < this.regex.length) {
            return this.regex[this.position];
        } else {
            return null;
        }
    }

    parse() : TreeNode | null {
        let expression = this.expression();
        if (this.hasMore()) {
            return null;
        }
        return expression;
    }

    match(c : string) : boolean {
        if (this.peek() === c) {
            this.position++;
            return true;
        }
        return false;
    }

    hasMore() : boolean {
        return this.position < this.regex.length;
    }

    isMetaChar(c : string) : boolean {
        return c === "*" || c === "+" || c === "?";
    }

    next() : string | null {
        let ch = this.peek();
        this.match(ch);

        return ch;
    }

    expression(): TreeNode | null {
        let term = this.term();
        while (this.hasMore() && this.peek() === "|") {
            this.match("|");
            let expression = this.expression();

            if (expression === null) {
                return null;
            }

            term = new TreeNode("expression", [term, new TreeNode("|", null), expression]);
        }
        return term;
    }

    term(): TreeNode | null {
        let factor = this.factor();

        while (this.hasMore() && !(this.peek() === "|") && !(this.peek() === ")")) {
            let term = this.term();

            factor = new TreeNode("term", [factor, term]);
        }

        return factor;
    }

    factor(): TreeNode | null {
        let atom = this.atom();

        while (this.hasMore() && this.isMetaChar(this.peek())) {
            let meta = this.next();
            atom = new TreeNode("factor", [atom, new TreeNode(meta, null)]);
        }

        return atom;
    }

    atom(): TreeNode | null {
        if (this.peek() === "(") {
            this.match("(");
            let expression = this.expression();
            this.match(")");

            return new TreeNode("atom", [new TreeNode("(", null), expression, new TreeNode(")", null)]);
        }
        let ch = this.char();
        return new TreeNode("atom", [ch]);
    }

    char(): TreeNode | null {
        if (this.isMetaChar(this.peek())) {
            return null;
        }

        if (this.peek() === "\\") {
            this.match("\\");
            let ch = this.next();
            return new TreeNode("char", [new TreeNode("\\", null), new TreeNode(ch, null)]);
        }

        let ch = this.next();
        return new TreeNode("char", [new TreeNode(ch, null)]);
    }

    // expression() : TreeNode | null {
    //     let term = this.term();
    //     if (this.hasMore() && this.peek() === "|") {
    //         this.match("|");
    //         let expression = this.expression();
    //
    //         if (expression === null) {
    //             return null;
    //         }
    //         return new TreeNode("expression", [term, new TreeNode("|", null), expression]);
    //     }
    //     return new TreeNode("expression", [term])
    // }
    //
    // term() : TreeNode | null {
    //     let factor = this.factor();
    //
    //     if(this.hasMore() && !(this.peek() === "|") ||!(this.peek() === ")")) {
    //         let term = this.term();
    //
    //         return new TreeNode("term", [factor, term]);
    //     }
    //
    //     return new TreeNode("term", [factor]);
    // }
    //
    // factor() : TreeNode | null {
    //     let atom = this.atom();
    //
    //     if(this.hasMore() && this.isMetaChar(this.peek())) {
    //         let meta = this.next();
    //         return new TreeNode("factor", [atom, new TreeNode(meta, null)]);
    //     }
    //
    //     return new TreeNode("factor", [atom]);
    // }
    //
    // atom() : TreeNode | null {
    //     if(this.peek() === '('){
    //         this.match("(");
    //         let expression = this.expression();
    //         this.match(")");
    //
    //         return new TreeNode("atom", [new TreeNode("(", null), expression, new TreeNode(")", null)]);
    //     }
    //     let ch = this.char();
    //     return new TreeNode("atom", [ch]);
    // }
    //
    // char() : TreeNode | null {
    //     if(this.isMetaChar(this.peek())){
    //         return null;
    //     }
    //
    //     if (this.peek() === "\\") {
    //         this.match("\\");
    //         let ch = this.next();
    //         return new TreeNode("char", [new TreeNode("\\", null), new TreeNode(ch, null)]);
    //     }
    //
    //     let ch = this.next();
    //     return new TreeNode("char", [new TreeNode(ch, null)]);
    // }


}