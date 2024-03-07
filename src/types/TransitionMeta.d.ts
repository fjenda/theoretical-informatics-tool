export interface TransitionMeta {
    state : string,
    input : string,
    stack : string,
    stateAfter : string,
    stackAfter : string[],
}