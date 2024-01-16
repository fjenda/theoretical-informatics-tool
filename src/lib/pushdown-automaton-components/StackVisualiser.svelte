<script lang="ts">
    import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
    let stackElements : string[] = [];
    export let stackFunction : () => string[] = () => {};

    function getStack() {
        stackElements = stackFunction()?.slice().reverse();

        if (stackElements?.length) {
            console.log("stack: " + stackElements);
        }
    }
</script>

<Button style="border-radius: 0.3rem; border: 0.1rem solid #4A3F64; background: #f4f9ff;">Stack</Button>
<Dropdown on:show={getStack}>
    {#each stackElements as element}
        <DropdownItem style="border: 0.1rem solid #c5c5c5;
                             min-width: 2rem;
                            ">{element}</DropdownItem>
    {/each}
</Dropdown>



<!--<style>-->
<!--    /*style="border-radius: 0.3rem; border: 0.1rem solid #4A3F64; background: #f4f9ff;*/-->
<!--    /*.but-1 {*/-->
<!--    /*    background: #2f3941;*/-->
<!--    /*    border: 0.05rem solid #4A3F64;*/-->
<!--    /*    color: #f4f9ff;*/-->
<!--    /*}*/-->
<!--</style>-->