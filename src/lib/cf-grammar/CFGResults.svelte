<script lang="ts">

</script>

<div class="cfg-results">
    CFG RESULTS
</div>

<style lang="scss">
    .cfg-results {
      width: 90%;
      height: 90%;

      min-height: 15.5rem;

      border-radius: 0.5rem;

      background-color: #f7f7f8;

      box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
      box-sizing: border-box;
    }

    :global(body.dark-mode) .cfg-results {
      background-color: #25252d;
    }

    @media screen and (max-width: 1000px) and (min-width: 768px) {
        .cfg-results {
            margin: 0.5rem auto;
        }
    }

    @media screen and (max-width: 768px) {
        .cfg-results {
            width: 95%;
            height: 95%;
            margin: 0.5rem auto;
        }
    }
</style>