<script lang="ts">
    let transitions : TransitionMeta[] = [];
    let textInput : string = "";
    export let updateGraphFunction : Function = () => {};
    export const processFunction : Function = processTransitions;

// Test input
// (q0,a,Z)=(q0,AZ);
// (q0,a,A)=(q0,AA);
// (q0,b,A)=(q1,∈);
// (q1,b,A)=(q1,∈);
// (q1,∈,Z)=(q1,∈);

    function parseRow(row : string) {
        let rowSplit = row.split(/[=,\n)(]/);
        for (let i = rowSplit.length - 1; i > 0; i--) {
            if (!rowSplit[i]?.trim()) {
                rowSplit.splice(i, 1);
            }
        }
        rowSplit.splice(0, 1);

        if (rowSplit.length === 5) {
            transitions.push({
                state: rowSplit[0],
                input: rowSplit[1],
                stack: rowSplit[2],
                stateAfter: rowSplit[3],
                stackAfter: rowSplit[4],
            });
        }
    }

    function processTransitions() {
        transitions = [];
        const rows = textInput.split(";");

        for (let row of rows) {
            parseRow(row);
        }

        updateGraphFunction(transitions);
    }
</script>

<textarea bind:value={textInput}
          class="function-input"
          rows="20"
          placeholder="(q0,a,Z)=(q1,A);" />

<style>
    .function-input {
        margin: 1rem 0;
        border-radius: 1rem;
        resize: none;
        width: 10.5rem;
    }
</style>