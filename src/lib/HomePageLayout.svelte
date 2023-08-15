<script lang="ts">
    import ThemeToggle from "./ThemeToggle.svelte";

    export let title : string;
</script>

<h1>{title}</h1>
<ThemeToggle />
<div class="wrap">
    <div class="layout">
        <slot />
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
        height: calc(100vh - 6.5rem);
        margin-top: 3rem;
        display: flex;
        justify-content: center;
        gap: 4rem;
    }

    .wrap {
        @extend .layout;
        width: 100%;
        max-width: 100%;
    }

    .header {
      display: flex;
    }

    :root {
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      font-weight: 400;

      //color-scheme: light dark;
      //color: #ffffff;
      //background-color: #181818;

      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-text-size-adjust: 100%;
    }

    :global(body) {
      color: #480d25;
      background-color: #c5c5c5;
      transition: background-color 0.3s, background-image 0.3s
    }

    :global(body.dark-mode) {
      color: #ffffff;
      background-color: #181818;
    }
</style>