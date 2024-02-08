<script lang="ts">
    import {grammar_results_store} from "../../stores/graphInitStore";

    let tableData;

    $: if (grammar_results_store) {
        tableData = $grammar_results_store;
    }
</script>

<div class="wrapper">
    <table class="styled-table">
        <thead>
        <tr>
            <th>#</th>
            <th>String</th>
            <th>Accepted</th>
            <th>Derivation</th>
        </tr>
        </thead>
        <tbody>
        {#if tableData}
            {#each tableData as row, i}
                <tr>
                    <td>{i+1}</td>
                    <td>{`"${row.input.join("")}"`}</td>
                    <td>{row.accepted ? "Yes" : "No"}</td>
                    <td>NIY</td>
                </tr>
            {/each}
        {/if}
        </tbody>
    </table>
</div>

<style lang="scss">
  .wrapper {
    width: 90%;
    height: 90%;

    min-height: 15.5rem;
    border-radius: 0.5rem;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    //margin: 0 auto;

    overflow: visible scroll;
  }

  @media screen and (max-width: 1000px) and (min-width: 768px) {
    .wrapper {
      margin: 0.5rem auto;
    }
  }

  @media screen and (max-width: 768px) {
    .wrapper {
      width: 95%;
      height: 95%;
      margin: 0.5rem auto;
    }
  }

  .styled-table {
    height: 100%;
    width: 100%;

    border-spacing: 0;

    font-size: 0.9em;
    font-family: sans-serif;

    background-color: #f7f7f8;

    table-layout: auto;

    border-collapse: separate;

    thead tr {
      background-color: #9CC6FB;
      color: #393939;

      position: sticky;
      top: 0;
    }

    th, td {
      padding: 0.5rem;
    }

    tbody tr {
      background-color: #f7f7f8;
      color: #101820;
      text-align: center;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  }

  :global(body.dark-mode) .styled-table {
    background-color: #25252d;
    color: #ffffff;

    thead tr {
      background-color: #4A3F64;
      color: #ffffff;
    }

    tbody tr {
      background-color: #25252d;
      color: #ffffff;
    }

    tr:nth-child(even) {
      background-color: #1f1f25;
    }
  }
</style>