export interface AutomatonConfiguration {
    states : string,
    input_alphabet : string[],
    stack_alphabet : string[],
    transitions : string[],
    initial_state : string,
    initial_stack_symbol : string,
    final_states : string[],
}