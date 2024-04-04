export interface TransitionType {
    state : string,
    input : string,
    stack : string,
    stackAfter : string[],
    stateAfter : string,
}