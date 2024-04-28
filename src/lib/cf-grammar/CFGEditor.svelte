<!--
    LHS Window where the grammar is drawn
    CFGGrammarInput.svelte is the component for the grammar-input slot
-->

<script lang="ts">
    import {tooltip} from "../tooltipUtils";

</script>

<div class="cfg-editor">
    <span class="ttip" use:tooltip={"Use this editor to create your grammar.\n\n" +
                                    "The start symbol will always be \"S\".\n" +
                                    "Use the standard pipe character for \"or\" [ | ].\n" +
                                    "If you want to write ε leave the field empty.\n" +
                                    "To remove a space press \"Backspace\" on an empty field.\n" +
                                    "To remove a row press the delete button on the left."}>
                ?</span>
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

  @media screen and (max-width: 1200px) {
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

  .ttip {
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    position: absolute;
    top: 1rem;
    left: 1.5rem;
    white-space: break-spaces;
    text-align: left;
  }

  .cfg-editor :global(#tooltip) {
    transform: translate(-5%, 0%);
  }
</style>