<script>
    import {Router, Route} from "svelte-routing"
    import LandingPage from "./pages/LandingPage.svelte";
    import PushdownAutomatonPage from "./pages/PushdownAutomatonPage.svelte";
    import FiniteStateMachinePage from "./pages/FiniteStateMachinePage.svelte";
    import ContextFreeGrammarPage from "./pages/ContextFreeGrammarPage.svelte";
    import SetOperationsPage from "./pages/SetOperationsPage.svelte";
    // import 'bootstrap/dist/css/bootstrap.min.css';
</script>

<Router basepath="/Theoretical-informatics-tool">
    <Route path="/tool/pushdown-automaton" component={PushdownAutomatonPage}/>
    <Route path="/tool/finite-state-automaton" component={FiniteStateMachinePage}/>
    <Route path="/tool/context-free-grammar" component={ContextFreeGrammarPage}/>
    <Route path="/tool/set-operations" component={SetOperationsPage}/>
    <Route path="/" component={LandingPage} />
    <Route>404</Route>
</Router>
