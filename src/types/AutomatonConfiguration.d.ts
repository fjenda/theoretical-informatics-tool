export interface AutomatonConfiguration {
    states : string,
    input_alphabet : string[],
    transitions : string[],
    initial_state : string[],
    final_states : string[],
    type : string,
}