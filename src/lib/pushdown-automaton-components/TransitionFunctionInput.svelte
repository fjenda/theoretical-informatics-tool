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
// (q0,a,Z)=(q0,aZ);
// (q0,b,Z)=(q0,bZ);
// (q0,a,a)=(q0,aa);
// (q0,a,b)=(q0,ab);
// (q0,b,a)=(q0,ba);
// (q0,b,b)=(q0,bb);
// (q0,c,a)=(q1,a);
// (q0,c,b)=(q1,b);
// (q1,a,a)=(q1,E);
// (q1,b,b)=(q1,E);
// (q1,E,Z)=(q1,E);
// (q0,E,Z)=(q1,E);
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