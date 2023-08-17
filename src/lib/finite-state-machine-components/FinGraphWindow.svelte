<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import type {ToolbarFunctions} from "../../types/ToolbarFunctions";

    let graph;
    let graphDiv : HTMLDivElement;

    export const toolbarFunctions = {
        addNode,
        addEdge,
        zoomIn,
        zoomOut,
        deleteGraphElement,
        saveGraph,
        loadGraph,
        deleteGraph,
        resetLayout,
    } as ToolbarFunctions;

    function addNode(node : GraphNodeMeta) {
        try {
            graph.add({
                group: "nodes",
                data: {id: node.id, label: node.label},
                classes: node.class,
            });
        } catch (e) {
            console.log(e);
        } finally {
            resetLayout();
        }
    }

    function addEdge(edge : GraphEdgeMeta) {
        try {
            graph.add({
                group: "edges",
                data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
            });
        } catch (e) {
            console.log(e);
        } finally {
            resetLayout();
        }
    }

    function zoomIn() {
        console.log(graph.zoom.level);
        // graph.zoom({level: graph.zoom.level.toString()});
    }

    function zoomOut() {

    }

    function deleteGraphElement() {
        graph.one("click", "edge, node", function(evt) {
            graph.remove("edge[source=\'" + this.id() + "\']");
            graph.remove("edge[target=\'" + this.id() + "\']");
            graph.remove("#" + this.id());
        });
    }

    function saveGraph () {

    }

    function loadGraph() {

    }

    function deleteGraph () {
        graph.elements().remove();
    }

    function resetLayout() {
        const layout = graph.makeLayout({ name: "circle" });
        layout.options.eles = graph.elements();
        layout.run();
    }

    function createGraph(nodes : GraphNodeMeta[], edges : GraphEdgeMeta[]) {
        graph = cytoscape({

            container: graphDiv,
            // wheelSensitivity: 0.2,
            minZoom: 0.5,
            maxZoom: 2,

            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": "#808080",
                        "border-color": "#000000",
                        "border-width": 1,
                        "label": "data(label)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "color": "#ffffff",
                    }
                },

                {
                    selector: ".start",
                    style: {
                        "background-color": "#6b6b6b",
                        "border-color": "#ff0000",
                    }
                },

                {
                    selector: ".finish",
                    style: {
                        "background-color": "#6b6b6b",
                        "border-width": 5,
                        "border-style": "double",
                    }
                },

                {
                    selector: "edge",
                    style: {
                        "width": 3,
                        "line-color": "#000000",
                        "target-arrow-color": "#000000",
                        "target-arrow-shape": "triangle",
                        "curve-style": "bezier",
                        "label": "data(label)",
                        "color": "#000000",
                        "text-background-opacity": 1,
                        "text-background-color": "#ffffff",
                        "text-background-shape": "rectangle",
                        "text-border-style": "solid",
                        "text-border-opacity": 1,
                        "text-border-width": "1px",
                        "text-border-color": "darkgray",
                    }
                },
            ],

            layout: {
                name: "circle"
            }

        });

        nodes.forEach(node => {
            addNode(node);
        });

        edges.forEach(edge => {
            addEdge(edge);
        });

        resetLayout();
    }

    function handleRemovingNode(node: string) {
        const nodeToRemove = graph.$id(node);
        if (nodeToRemove.isNode()) {
            console.log(`getted here`);
            nodeToRemove.remove();

        } else {
            console.log(`Node with ID ${node} not found.\`)`);
        }

    }

    let graphNodes : GraphNodeMeta[] = [
        { id: "1", label: "1", class: "start"},
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "3", class: "finish" },
    ];

    let graphEdges : GraphEdgeMeta[] = [
        { id: "1-2", label: "A", source: "1", target: "1" },
        { id: "2-3", label: "b", source: "2", target: "3" },
        { id: "3-1", label: "A", source: "3", target: "1" },
    ];



    onMount(() => {
        createGraph(graphNodes, graphEdges);
        // console.log(graph);

        graph.on('cxttap', 'node', function(evt){
            console.log( 'clicked ' + this.id() );
            const clickedNode = this.id();

            handleRemovingNode(clickedNode);
        });
    });



</script>

<div class="window">
    <slot />
    <div bind:this={graphDiv} class="graph" />
</div>

<style>
    .window {
        margin: 0 3rem;
        border-radius: 2vw;
        width: 95rem;
        max-width: 90%;
        height: 80rem;
        max-height: 85%;
        background: #ffffff;
    }

    :global(body.dark-mode) .window {
        background: #c5c5c5;
    }

    .graph {
        overflow: hidden;
        border-radius: 2vw;
        height: calc(100% - 5vh);
    }
</style>