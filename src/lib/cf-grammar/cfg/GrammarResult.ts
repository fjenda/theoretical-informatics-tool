/*
    GrammarResult.ts
    Class containing the grammar result logic
    Author: Jan Fojtík
*/

export class GrammarResult {
    // An array of input string split into individual symbols
    input: string[];

    // A boolean to check if the input was accepted
    accepted: boolean;

    // A number specifying how many derivations were made (1 or 2 in this version)
    length: number;

    // Derivation(s) of the input string
    derivation: { rule: string; result: string }[] |
                { rule: string; result: string }[][];


    // Constructor for the GrammarResult
    constructor(input: string[], accepted: boolean, length: number, derivation: { rule: string; result: string }[][] |
                                                                                { rule: string; result: string }[])  {
        this.input = input;
        this.accepted = accepted;
        this.length = length;
        this.derivation = derivation;
    }
}