<script setup>
import { ref } from "vue";
const runtimeConfig = useRuntimeConfig();
console.log(runtimeConfig.public.STATION_LIST_API_ENDPOINT);

const props = defineProps({
  stationList: Array,
  lineList: Array
});
const emit = defineEmits()

const searchWord = ref("");

const searchResults = ref([]);

const beginMatchStations = (keyword, kana = false, en = false) => {
  //駅名を前方一致検索 駅情報の配列を返す
  const stations = props.stationList;
  let results = new Array();
  for (let i = 0; i < stations.length; i++) {
    const stationData = stations[i];
    if (
      !stationData.name.indexOf(keyword) ||
      (kana &&
        stationData.name_kana &&
        !stationData.name_kana.indexOf(keyword)) ||
      (en && stationData.name_kana && !stationData.name_en.indexOf(keyword))
    ) {
      results.push(stationData);
    }
  }
  return results;
};

const searchStation = () => {
    if (searchWord.value) {
        const res = beginMatchStations(searchWord.value, true, false);
        searchResults.value = res;
    } else {
        searchResults.value = []
    }
};

const selectStation = (station) => {
  emit('close-station-select', station)
}
</script>

<template>
  <div id="station_search_page" class="main-panel-page">
    <div class="station-search-input-container">
      <div
        id="station_search_back_button"
        class="material-icons"
        @click="$emit('close-station-select')"
      >
        arrow_back
      </div>
      <input
        type="text"
        id="station_search_input"
        placeholder="駅名を入力"
        autocomplete="off"
        v-model="searchWord"
        @input="searchStation"
      />
    </div>
    <div id="station_search_result">
      <div v-for="station in searchResults" :key="station.id"  class="station-search-list-content" stationid="{{result.id}}"
        @click="selectStation(station)">
        <div class="name">{{station.name}}</div>
        <div class="name-kana">{{station.name_kana}}</div>
        <div class="detail">
          <span v-for="lineId in station.lines" :key="lineList[lineId].id" class="line" 
            :style="{backgroundColor: lineList[lineId].color || '#546e7a'}">
            <span :style="{color: lineList[lineId].color}">
              {{lineList[lineId].name}}
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>