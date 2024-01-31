<script lang="ts">

</script>

<div class="cfg-input">
    <h1>Test input</h1>
    <slot />
</div>

<style lang="scss">
  h1 {
    font-size: 1.25rem;
  }

  .cfg-input {
    height: 90%;
    width: 90%;

    min-height: 15.5rem;

    border-radius: 0.5rem;

    background-color: #f7f7f8;;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    gap: 0.5rem;
  }

  :global(body.dark-mode) .cfg-input {
    background-color: #25252d;
  }

  @media screen and (max-width: 1000px) and (min-width: 768px) {
    .cfg-input {
      margin: 0.5rem auto;
    }
  }

  @media screen and (max-width: 768px) {
    .cfg-input {
      width: 95%;
      height: 95%;
      margin: 0.5rem auto;
    }
  }
</style>