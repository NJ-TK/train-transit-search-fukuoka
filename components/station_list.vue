<script setup>
import {ref} from 'vue'
const runtimeConfig = useRuntimeConfig();
console.log(runtimeConfig.public.STATION_LIST_API_ENDPOINT)

const props = defineProps({
    stationList: Array
})

const searchWord = ref('')

const beginMatchStations = (keyword, kana = false, en = false) => {
    //駅名を前方一致検索 駅情報の配列を返す
    const stations = props.stationList
    let results = new Array();
    for (let i=0; i<stations.length; i++) {
        const stationData = stations[i];
        if(!stationData.name.indexOf(keyword) ||
            (kana && stationData.name_kana && !stationData.name_kana.indexOf(keyword)) || 
            (en && stationData.name_kana && !stationData.name_en.indexOf(keyword))) {
               results.push(stationData);
        }
    }
    return results;
}

const searchStation = () => {
    const res = beginMatchStations(searchWord.value, true, false)
    console.log(res)
}



</script>

<template>
    <div id="station_search_page" class="main-panel-page">
        <div class="station-search-input-container">
            <div id="station_search_back_button" class="material-icons" @click="$emit('back-button-clicked')">arrow_back</div>
            <input type="text" id="station_search_input" placeholder="駅名を入力" autocomplete="off" v-model="searchWord" @input="searchStation">
        </div>
        <div id="station_search_result">
            <!-- {{count}} -->
            <div>
          <ul>
            <li v-for="station in stationList" :key="station.id">{{ station.name }}</li>
          </ul>
      </div>
        </div>
    </div>
</template>