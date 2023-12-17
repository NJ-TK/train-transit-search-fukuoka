<script>
import { ref } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import home from "../components/home.vue";
import stationList from "../components/station_list.vue";

export default {
  components: {
    home,
  },
  data() {
    return {
      isStationListVisible: false,
    };
  },
  methods: {
    showStationList() {
      this.isStationListVisible = !this.isStationListVisible;
      console.log(this.isStationListVisible);
    },
  },
};
</script>
<template>
  <div>
    <section id="main_panel">
      <stationList v-if="isStationListVisible" />
      <home @origin-station-clicked="showStationList" v-else="isStationListVisible" />
    </section>
    <section id="map_panel">
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