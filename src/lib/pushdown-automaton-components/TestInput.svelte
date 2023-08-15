<script lang="ts">
    let value =  "";
</script>

<div class="input-box">
    <input bind:value={value} class="test-input" placeholder="ex. 'AB'">
</div>

<style>
    .input-box {
        text-align: center;
        margin: 1rem 0;
    }

    .test-input {
        text-align: center;
        font-size: 1.8rem;
        height: 5vh;
        width: 11.5vw;
        border-radius: 2.5rem;
    }
</style>
