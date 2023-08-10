<script lang="ts">
    export let title : string;
</script>

<h1>{title}</h1>
<div class="wrap">
    <div class="layout">
        <slot />
    </div>
</div>



<style lang="scss">
  h1 {
    margin: 2rem;
    font-size: 2.5rem;
    //text-align: center;
  }

  .layout {
    height: calc(100vh - 6.5rem);
    margin-top: 3rem;
    gap: 2rem;
  }

  .wrap {

  }
</style>