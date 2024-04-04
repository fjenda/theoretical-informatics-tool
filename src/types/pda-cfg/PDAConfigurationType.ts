import type {TransitionType} from "./TransitionType";

export interface PDAConfigurationType {
    states : string[],
    input_alphabet : string[],
    stack_alphabet : string[],
    transitions : TransitionType[],
    initial_state : string,
    initial_stack_symbol : string,
    final_states? : string[],
    type : string,
}