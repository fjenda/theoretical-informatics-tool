<script>
  import LandingPage from "./pages/LandingPage.svelte";
  import {Router, Route} from "svelte-routing";
  import PushdownAutomatonPage from "./pages/PushdownAutomatonPage.svelte";
</script>

<Router>
    <Route path="/tool/pushdown-automaton" component={PushdownAutomatonPage}/>
    <Route path="/" component={LandingPage} />
    <Route>404</Route>
</Router>
