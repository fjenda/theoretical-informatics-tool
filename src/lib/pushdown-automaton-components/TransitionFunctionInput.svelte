<script lang="ts">
    let transitions : TransitionMeta[] = [];
    let textInput : string = "";
    export let updateGraphFunction : Function = () => {};
    export const processFunction : Function = processTransitions;

// Test input
// (q0,a,Z)=(q0,AZ);
// (q0,a,A)=(q0,AA);
// (q0,b,A)=(q1,E);
// (q1,b,A)=(q1,E);
// (q1,E,Z)=(q1,E);
// aaabbb - patri
// aabbb - nepatri
// ----------------
// a
// abcba - patri
// abca - nepatri
// ----------------
// (q0,a,Z)=(q0,xxZ);
// (q0,a,x)=(q0,xxx);
// (q0,b,x)=(q1,E);
// (q1,b,x)=(q1,E);
// (q1,E,Z)=(qf,E);
// aabbbb - patri
// ab - nepatri
// ----------------
// (q,E,S)=(q,abSba);
// (q,E,S)=(q,A);
// (q,E,A)=(q,cAc);
// (q,E,A)=(q,aB);
// (q,E,B)=(q,aB);
// (q,E,B)=(q,E);
// (q,a,a)=(q,E);
// (q,b,b)=(q,E);
// (q,c,c)=(q,E);
// (q,E,Z)=(q,E);
// abaaba - patri
// ----------------

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

<textarea id="function-input"
          bind:value={textInput}
          class="function-input"
          rows="20"
          placeholder="(q0,a,Z)=(q1,AZ);" />

<style>
    .function-input {
        margin: 1rem 0;
        border-radius: 1rem;
        resize: none;
        height: 15rem;
        width: 10.5rem;
    }
</style>