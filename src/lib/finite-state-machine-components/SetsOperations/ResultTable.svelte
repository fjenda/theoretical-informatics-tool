<script lang="ts">


</script>

<div class="wrapper">
    <div class="table">
        <div class="tableHead">
            <div class="tableRow">
                <div class="tableHeadCell">Nodes</div>
                <div class="tableHeadCell">a</div>
                <div class="tableHeadCell">b</div>
            </div>
        </div>
        <div class="tableBody">
            <div class="tableRow">
                <div class="tableCell">1</div>
                <div class="tableCell">2</div>
                <div class="tableCell">3</div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">

  .wrapper{
    width: 24vw;
    height: 34.2vh;

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
      width: 45vw;
      height: 33.2vh;
    }
  }

  @media screen and (max-width: 768px) {
    .wrapper {
      width: 95vw;
      height: 40vh;
      margin: 0.5rem auto;
    }
  }

  .active {
    background-color: #dddddd !important;
  }

  :global(body.dark-mode) .active {
    background-color: #393939 !important;
  }

  .table {
    display: table;
    width: 100%;
    height: 100%;

    background-color: #f4f9ff;
    color: #393939;
  }

  :global(body.dark-mode) .table {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .tableHead {
    display: table-header-group;

    position: sticky;
    top: 0;

    z-index: 10;

    background-color: #9CC6FB;
    color: #393939;
  }

  :global(body.dark-mode) .tableHead {
    background-color: #4A3F64;
    color: #f4f9ff;
  }

  .tableBody {
    display: table-row-group;
  }

  :global(body.dark-mode) .tableBody {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .tableRow {
    display: table-row;
  }

  :global(body.dark-mode) .tableRow {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .tableCell {
    display: table-cell;
    vertical-align: inherit;
  }

  .tableHeadCell, .tableCell {
    display: table-cell;
    padding: 0.5rem;
    text-align: center;
    vertical-align: middle;
  }

  .tableHeadCell{
    font-weight: bold;
    background-color: #9CC6FB;
    color: #393939;
    height: 1rem;
  }

  :global(body.dark-mode) .tableHeadCell {
    background-color: #4A3F64;
    color: #f4f9ff;
  }

  .tableRow:nth-child(even) {
    background-color: #f2f2f2;
  }

  :global(body.dark-mode) .tableRow:nth-child(even) {
    background-color: #1f1f25;
  }

</style>

