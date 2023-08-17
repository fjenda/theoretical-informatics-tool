<script>
  import LandingPage from "./pages/LandingPage.svelte";
  import {Router, Route} from "svelte-routing";
  import PushdownAutomatonPage from "./pages/PushdownAutomatonPage.svelte";
  import FiniteStateMachinePage from "./pages/FiniteStateMachinePage.svelte";
</script>

<Router>
    <Route path="/tool/pushdown-automaton" component={PushdownAutomatonPage}/>
    <Route path="/tool/finite-state-machine" component={FiniteStateMachinePage}/>
    <Route path="/" component={LandingPage} />
    <Route>404</Route>
</Router>
