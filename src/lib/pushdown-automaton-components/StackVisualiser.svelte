<script lang="ts">
    import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
    let stackElements : string[] = [];
    export let stackFunction : () => string[] = () => {};

    function getStack() {
        stackElements = stackFunction()?.reverse();
        console.log("stack: " + stackElements);
    }
</script>

<Button color="purple">Stack</Button>
<Dropdown on:show={getStack}>
    {#each stackElements as element}
        <DropdownItem>{element}</DropdownItem>
    {/each}
</Dropdown>