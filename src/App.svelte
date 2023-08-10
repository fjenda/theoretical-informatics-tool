<script lang="ts">
  import HomePageLayout from "./lib/HomePageLayout.svelte";
  import GlassPanel from "./lib/GlassPanel.svelte";
  import type {ToolMeta} from "./types/ToolMeta";
  import DebugView from "./lib/DebugView.svelte";
  import Button from "./lib/Button.svelte";
  import Flare from "./lib/Flare.svelte";

  const tools : ToolMeta [] = [
    {
      title: "Finite-state machine",
      author: "Marek Krúpa",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.",
      scriptsUrl: "www.google.com",
      toolUrl: "www.seznam.cz",
    },
    {
      title: "Pushdown automaton",
      author: "Jan Fojtík",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.",
      scriptsUrl: "www.google.com",
      toolUrl: "www.seznam.cz",
    }
  ]
</script>

<DebugView>
  <main>
    <Flare />
    <HomePageLayout title="Theoretical Informatics Tool for Students (TITS)">
      {#each tools as tool}
        <GlassPanel info={tool}>
          <Button type="readme" url={tool.toolUrl}/>
          <Button type="tool" url={tool.toolUrl}/>
        </GlassPanel>
      {/each}
    </HomePageLayout>

  <!--  <div class="flare"></div>-->

  <!--        <button class="read-more-button">-->
  <!--          Read more-->
  <!--        </button>-->
  <!--      </div>-->

  <!--      <div class="tool-box">-->
  <!--        <button class="tool-button">-->
  <!--          Tool-->
  <!--        </button>-->
  <!--      </div>-->
  <!--    </div>-->
  </main>
</DebugView>