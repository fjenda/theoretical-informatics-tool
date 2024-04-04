<script lang="ts">

</script>

<div class="cfg-editor">
    <div class="definition-button">
        <slot name="definition"/>
    </div>
    <slot name="grammar-input"/>
    <div class="button-wrapper">
        <slot name="back-button"/>
        <slot name="convert-button"/>
    </div>
</div>

<style lang="scss">
  .cfg-editor {
    position: relative;

    width: 95%;
    height: 95%;

    min-height: 25.5rem;

    border-radius: 0.5rem;

    background-color: #f7f7f8;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    gap: 0.5rem;
  }

  :global(body.dark-mode) .cfg-editor {
    background-color: #25252d;
  }

  @media screen and (max-width: 1000px) {
    .cfg-editor {
      margin: 0.5rem auto;
    }
  }

  .button-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    margin: auto 2rem 1rem 2rem;
  }

  .definition-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
</style>