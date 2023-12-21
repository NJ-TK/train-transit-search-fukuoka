<script setup>
import headerComponent from '~/components/header.vue'
import '@/assets/styles/route.css'

const router = useRouter();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

if (isNaN(route.params.origin) || isNaN(route.params.destination)) {
  throw new Error("param_error");
}
const originStationId = Number(route.params.origin);
let originStationName = ''
const destinationStationId = Number(route.params.destination);
let destinationStationName = ''
let timeRequiredHourMin = [0, 0]
let requiredTime = 0

let resultRoute = {};

const secToMin = (s) => {
    if (s==0) return [0, 0]
    const min = Math.floor(s/60), sec = s % 60
    return [min, sec]
}

const getTimeStr = (t, format) => {
  const timeHourMin = secToMin(t)
  return format.replace('%h%', timeHourMin[0]).replace('%m%', ('00'+Math.floor(timeHourMin[1])).slice(-2))
}

const fetchRoute = async () => {
  // if (!runtimeConfig.ROUTE_API_ENDPOINT) return;
  const params = {
    origin: originStationId,
    destination: destinationStationId,
  };
  const query = new URLSearchParams(params);
  const { data } = await useAsyncData(
    'fetchMessage',
    () => $fetch(runtimeConfig.ROUTE_API_ENDPOINT + '?' + query).catch((error) => console.log(error))
  )
  resultRoute = data.value;
  const stations = resultRoute.stations
  originStationName = stations[0].name
  destinationStationName = stations[stations.length - 1].name
  const times = resultRoute.times
  requiredTime = times[times.length - 1]
  timeRequiredHourMin = secToMin(times[times.length - 1])
  
};

await fetchRoute();

const backToHome = () => {
  router.push({ path: `/` });
};

</script>

<template>
  <div id="app">
    <section id="main_panel">
      <div id="route_page" class="main-panel-page">
        <headerComponent :headerIcon="'route'" :headerTitle="'検索結果'" />

        <div class="page-content">
          <div class="route-info-panel">
              <div id="route_title">
                <span id="origin_station_name">{{ originStationName }}</span>
                <span class="material-icons" style="vertical-align: -3px;">double_arrow</span>
                <span id="destination_station_name">{{ destinationStationName }}</span>
              </div>
              <div id="route_detail">
                所要時間 約{{ timeRequiredHourMin[0] }}分{{ ('00'+Math.floor(timeRequiredHourMin[1])).slice(-2) }}秒
              </div>
          </div>
        </div>

        <div id="route_panel">
          <template v-for="(station, index) in resultRoute.stations">
            <div v-if="station.isTransfer" :key="station.id" class="station">
                <div class="time">{{ getTimeStr(resultRoute.times[index], '%h%:%m%') }}</div>
                <div class="line-graphic-container">
                  <div class="line-graphic bottom" style="background-color: {{  }};"></div> <div class="mark" style="border-color: rgb(238, 61, 73);"></div>
                </div>
                <div class="refs">
                  <div class="st-ref bottom" style="background-color: rgb(238, 61, 73);"><span style="color: rgb(238, 61, 73);">JB11</span></div>
                </div>
                <div class="name">{{ station.name }}</div>
            </div>
          </template>
        </div>

        <h1>{{ $route.params.origin }} -> {{ $route.params.destination }}</h1>
        <pre>{{ resultRoute.times }}</pre>
      </div>
    </section>
  </div>
</template>