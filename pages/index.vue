<script setup>
import { createApp, ref, onMounted } from "vue";
import home from "../components/home.vue";
import stationListComponent from "../components/station_list.vue"
import trainMap from '../components/map.vue'

const runtimeConfig = useRuntimeConfig();

let isStationListVisible = ref(false)

const params = {requestType: 'stationsAndLines'}
const query = new URLSearchParams(params)

let originStationId = null
let originStationName = ''
let destinationStationId = null
let destinationStationName = ''

let stationSelectTarget = ''

let stationList = new Array()
let lineList = new Array()

const showStationList = (target) => {
  if (target == 'origin') stationSelectTarget = 'origin'
  else if (target == 'destination') stationSelectTarget = 'destination'
  else stationSelectTarget = ''
  isStationListVisible.value = true
}
const hideStationList = () => isStationListVisible.value = false

const fetchStationList = async () => {
  try {
    const { data } = await useAsyncData(
      'stationDb',
      () => {
        return $fetch(runtimeConfig.public.stationListApiEndpoint + '?' + query)
      }
    )
    const data_ = typeof data.value == 'string' ? JSON.parse(data.value) : data.value
    stationList = data_.stations
    lineList = data_.lines
  } catch (error) {
    console.log(error)
  }  
}

fetchStationList()

const closeStationSelect = (station = null) => {
  if (station) {
    if (stationSelectTarget === 'origin') {
      originStationId = station.id
      originStationName = station.name
    } else if (stationSelectTarget === 'destination') {
      destinationStationId = station.id
      destinationStationName = station.name
    }
  }
  hideStationList()
}

</script>
<template>
  <div id="app">
    <section id="main_panel">
      <stationListComponent v-if="isStationListVisible" @close-station-select="closeStationSelect"
         :stationList="stationList" :lineList="lineList" />
      <home v-show="!isStationListVisible" @origin-station-clicked="showStationList" 
        :originStationName="originStationName" :originStationId="originStationId"
        :destinationStationName="destinationStationName" :destinationStationId="destinationStationId" />        
    </section>
    
    <trainMap />
  </div>
</template>
<style scoped>
</style>