<script lang="ts">
    let width = 250, height = 250, x = 150, y = 100, xspeed = 5, yspeed = 5;
</script>

<div class="flare" style="left: {x}px;top: {y}px" />

<style>
    .flare {
        position: absolute;

        /*top: 100px;*/
        /*left: 150px;*/

        height: 294px;
        width: 285px;
        background-image: radial-gradient(circle at center, rgba(103,36,243,100%), rgba(255,77,194,0%));
        border-radius: 50%;
        display: inline-block;
        filter: blur(50px);
    }
</style>