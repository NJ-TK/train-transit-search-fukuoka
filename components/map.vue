<script setup>
import '@/assets/styles/train_map.css'
const trainMapUrl = '/train_map/fukuoka_route_map.svg'
const trainMapPdfUrl = '/train_map/fukuoka_route_map.pdf'
let mapWidth = 300
let mapHeight = 200
let mapScale = 1

onMounted(() => {
    mapWidth = train_map.clientWidth
    mapHeight = train_map.clientHeight
})
const addMapScale = (a)  => {
    if (mapScale + a >= 5 || mapScale + a <= 0.2) return false;
    mapScale += a;
}
const scaleMap = (scale) => {
    train_map.setAttribute('width', (mapWidth * scale) + 'mm');
    train_map.setAttribute('height', (mapHeight * scale) + 'mm');
}
const zoomInMap = () => {
    addMapScale(0.2);
    scaleMap(mapScale);
}
const zoomOutMap = () => {
    addMapScale(-0.2);
    scaleMap(mapScale);
}
const openTrainMapRaw = () => {
    window.open(trainMapUrl)
}
const openTrainMapPdf = () => {
    window.open(trainMapPdfUrl)
}
   
</script>
<template>
    <section id="map_panel">
        <div id="train_map_container">
            <object ref="train_map" id="train_map" :data="trainMapUrl" type="image/svg+xml"></object>
        </div>
        <div id="map_control">
            <!-- <button @click="zoomInMap" id="train_map_zoom_in" class="material-icons">zoom_in</button>
            <button @click="zoomOutMap" id="train_map_zoom_out" class="material-icons">zoom_out</button> -->
            <button @click="openTrainMapRaw" id="train_map_raw" class="material-icons">open_in_new</button>
            <button @click="openTrainMapPdf" id="train_map_pdf" class="material-icons">picture_as_pdf</button>
        </div>
    </section>
</template>