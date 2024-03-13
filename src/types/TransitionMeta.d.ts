export interface TransitionMeta {
    state : string,
    stateLabel : string,
    input : string,
    stack : string,
    stackAfter : string[],
    stateAfter : string,
    stateAfterLabel : string,
}