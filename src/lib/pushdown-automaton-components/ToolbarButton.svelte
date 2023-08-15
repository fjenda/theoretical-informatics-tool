<script lang="ts">
import cytoscape from "cytoscape";
import {onMount} from "svelte";
import ToolbarModal from "./ToolbarModal.svelte";

export let type : ToolbarButtonType;
export let text : string = "";

let graphDiv;
let showModal = false;

function modalPicker(type) {
    switch (type) {
        case "new-node":
    }
}
function addNode(div, node : GraphNodeMeta) {
    div.add({
        group: "nodes",
        data: { id: node.id, label: node.label }
    });
}

function addEdge(div, edge : GraphEdgeMeta) {
    div.add({
        group: "edges",
        data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
    });
}

function refreshLayout(div) {
    // todo

    var layout = div.makeLayout({ name: "circle" });
    layout.options.eles = div.elements();
    layout.run();
}

function createGraph(div, nodes : GraphNodeMeta[], edges : GraphEdgeMeta[]) {
    div = cytoscape({

        container: document.getElementById("graph"),

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
                    "color": "#ffffff"
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
                    "text-border-color": "darkgray"
                }
            }
        ],

        layout: {
            name: "circle"
        }

    });

    nodes.forEach(node => {
        addNode(div, node);
    });

    edges.forEach(edge => {
        addEdge(div, edge);
    });

    refreshLayout(div);
}


let graphNodes : GraphNodeMeta[] = [
    { id: "q0", label: "q0" },
    { id: "q1", label: "q1" },
    { id: "qF", label: "qF", finish: true },
];

let graphEdges : GraphEdgeMeta[] = [
    { id: "q0-q1", label: "a;E;a", source: "q0", target: "q1" },
    { id: "q1-qF", label: "a;a;E", source: "q1", target: "qF" },
    { id: "q1-q0", label: "b;a;E", source: "q1", target: "q0" },
];

onMount(() => {
    createGraph(graphDiv, graphNodes, graphEdges);
});
</script>


<button on:click={() => (showModal = true)}>
    {text}
</button>

<ToolbarModal bind:showModal type={type}>
    <h2 slot="header">
        {type}
    </h2>

    <ol class="definition-list">
        <li>Input the name of the new node that doesn't exist already.</li>
        <li>Click add to finish.</li>
    </ol>
</ToolbarModal>

<style>
    button {
        border-radius: 2rem;
    }
</style>


