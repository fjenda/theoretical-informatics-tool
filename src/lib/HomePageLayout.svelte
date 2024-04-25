<script lang="ts">
    import ThemeToggle from "./ThemeToggle.svelte";

    export let title: string;
</script>

<h1>{title}</h1>
<ThemeToggle/>
<div class="wrap">
    <div class="layout">
        <slot/>
    </div>
</div>


<style lang="scss">
  h1 {
    margin: 2rem;
    font-size: 2.5rem;
    text-align: center;
  }

  .layout {
    width: 60rem;
    max-width: 90%;
    //height: calc(100vh - 6.5rem);
    margin: 0 auto;
    display: flex;
    justify-content: center;
    gap: 4rem;
  }

  @media screen and (max-width: 1023px) {
    .layout {
      flex-direction: column;
      height: auto;
      align-items: center;
      margin: 0 auto;
    }
  }

  .wrap {
    @extend .layout;
    width: 100%;
    max-width: 100%;
  }

  :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    font-weight: 400;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }

  :global(body) {
    color: #363636;
    background-color: #cde2fd;
    transition: background-color 0.3s;
  }

  :global(body.dark-mode) {
    color: #f4f9ff;
    background-color: #101820;
  }
</style>