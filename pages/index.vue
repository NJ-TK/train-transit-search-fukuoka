<script setup>
import { createApp, ref, onMounted } from "vue";
import home from "../components/home.vue";
import stationListComponent from "../components/station_list.vue";
// import {useAsyncData} from 'nuxt'
const runtimeConfig = useRuntimeConfig();

let isStationListVisible = ref(false)

const showStationList = () => isStationListVisible.value = true
const hideStationList = () => isStationListVisible.value = false

const params = {requestType: 'stations'};
const query = new URLSearchParams(params);

let stationList = new Array()

const fetchMessage = async () => {
  const { data } = await useAsyncData(
    'fetchMessage',
    () => {
      return $fetch(runtimeConfig.STATION_LIST_API_ENDPOINT + '?' + query);
    }
  );
  stationList = data.value;
};

await fetchMessage();

console.log(stationList[0]);


</script>
<template>
  <div id="app">
    <section id="main_panel">
      <stationListComponent v-if="isStationListVisible" @back-button-clicked="hideStationList" :station-list="stationList" />
      <home @origin-station-clicked="showStationList" v-else />
    </section>
    <section id="map_panel">
      a
      
      <!-- {{stationList}} -->
      <div>
          <ul>
            <li v-for="station in stationList" :key="station.id">{{ station.name }}</li>
          </ul>
      </div>
      <!-- <div id="train_map_container">
                <object id="train_map" data="train_map/train_map.svg" type="image/svg+xml"></object>
            </div> -->
      <div id="map_control">
        <!-- <button id="train_map_zoom_in" class="material-icons">zoom_in</button>
                <button id="train_map_zoom_out" class="material-icons">zoom_out</button> -->
        <button id="train_map_raw" class="material-icons">open_in_new</button>
      </div>
    </section>
  </div>
</template>
<style scoped>
</style>