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
  let transferTime = 5
  if (!isNaN(route.query.transferTime)) transferTime = Number(route.query.transferTime)
  let mode = 1
  const queryParamMode = route.query.mode
  if (queryParamMode === '0' || queryParamMode === '1' || queryParamMode === '2') mode = Number(queryParamMode)
  const params = {
    origin: originStationId,
    destination: destinationStationId,
    useBulletTrain: !(route.query.useBulletTrain === 'false'),
    useJR: !(route.query.useJR === 'false'),
    usePrivateTrain: !(route.query.usePrivateTrain === 'false'),
    useSubwayAndMonorail: !(route.query.useSubwayAndMonorail === 'false'),
    transferTime: route.query.transferTime,
    mode: mode
  }
  const query = new URLSearchParams(params);
  const { data } = await useAsyncData(
    'fetchMessage',
    () => $fetch(runtimeConfig.ROUTE_API_ENDPOINT + '?' + query).catch((error) => console.log(error))
  )
  resultRoute = data.value;
  originStationName = resultRoute.originStationName
  destinationStationName = resultRoute.destinationStationName
  requiredTime = transferTime
  timeRequiredHourMin = secToMin(requiredTime)
  
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
                所要時間 約{{ timeRequiredHourMin[0] }}時間{{ ('00'+Math.floor(timeRequiredHourMin[1])).slice(-2) }}分
              </div>
          </div>
        </div>

        <div id="route_panel">
          <template v-for="entry in resultRoute.route">
            <div v-if="entry.type === 'station'" :key="entry.id" class="station">
                <div class="time">{{ getTimeStr(entry.time, '%h%:%m%') }}</div>
                <div class="line-graphic-container">
                  <div v-if="entry.hasPreviousLine && !entry.is_connected_line_bullet[0]" class="line-graphic top" :style="{backgroundColor: entry.colors[0] || '#888'}"></div>
                  <div v-if="entry.hasPreviousLine && entry.is_connected_line_bullet[0]" class="line-graphic top double" 
                    :style="{backgroundColor: '#fff', borderColor: entry.colors[0] || '#888'}"></div>

                  <div v-if="entry.hasNextLine && !entry.is_connected_line_bullet[1]" class="line-graphic bottom" :style="{backgroundColor: entry.colors[1] || '#888'}"></div>
                  <div v-if="entry.hasNextLine && entry.is_connected_line_bullet[1]" class="line-graphic bottom double" 
                    :style="{backgroundColor: '#fff', borderColor: entry.colors[1] || '#888'}"></div>

                  <div v-if="entry.hasPreviousLine" class="mark" :class="[entry.hasNextLine ? 'top' : '']" :style="{borderColor: entry.colors[0] || '#888'}"></div>
                  <div v-if="entry.hasNextLine" class="mark" :class="[entry.hasPreviousLine ? 'bottom' : '']" :style="{borderColor: entry.colors[1] || '#888'}"></div>
                </div>
                <div class="refs">
                  <div v-if="entry.refs[0]" class="st-ref top" :style="{backgroundColor: entry.colors[0] || '#888'}">
                    <span :style="{color: entry.colors[0] || '#888'}">{{ entry.refs[0] }}</span>
                  </div>
                  <div v-if="entry.refs[1]" class="st-ref bottom" :style="{backgroundColor: entry.colors[1] || '#888'}">
                    <span :style="{color: entry.colors[1] || '#888'}">{{  entry.refs[1] }}</span>
                  </div>
                </div>
                <div class="name">{{ entry.name }}</div>
            </div>

            <div v-else-if="entry.type === 'line'" :key="entry.lineId">
              <div class="line-info">
                  <div v-if="entry.line_type === 'bullet'" class="line-graphic double" :style="{borderColor: entry.line_color || '#888', backgroundColor: '#fff'}"></div>
                  <div v-else class="line-graphic" :style="{backgroundColor: entry.line_color || '#888'}"></div>
                  <div class="line-info-contents">
                      <div class="line-prime-info">
                          <div class="ln-ref" :class="[entry.ref ? '' : 'blank']" :style="{backgroundColor: entry.line_color || '#888'}">
                            <span :style="{color: entry.line_color || '#888'}">{{ entry.ref || '' }}</span>
                          </div>
                          <div class="text">
                              <div class="owner">{{ entry.owner || '' }}</div>
                              <div class="name">{{ entry.line_name }}</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div class="pass-stations">
                  <details>
                      <summary>
                        <div v-if="entry.line_type === 'bullet'" class="line-graphic double" :style="{borderColor: entry.line_color || '#888', backgroundColor: '#fff'}"></div>
                        <div v-else class="line-graphic" :style="{backgroundColor: entry.line_color || '#888'}"></div>
                        <span class="material-icons"></span><span class="pass-st-count">{{ entry.pass_stations.length + 1 }}駅</span></summary>
                      <div v-for="station in entry.pass_stations" :key="station.id" class="list">
                        <div class="station">
                            <div class="time">{{ getTimeStr(station.time, '%h%:%m%') }}</div>
                            <div v-if="entry.line_type === 'bullet'" class="line-graphic double" :style="{borderColor: entry.line_color || '#888', backgroundColor: '#fff'}"></div>
                            <div v-else class="line-graphic" :style="{backgroundColor: entry.line_color || '#888'}"></div>
                            <div class="mark"></div>
                            <div v-if="station.refs[0]" class="st-ref bottom" :style="{backgroundColor: station.colors[0] || '#888'}">
                              <span :style="{color: station.colors[0] || '#888'}">{{  station.refs[0] }}</span>
                            </div>
                            <div class="name">{{ station.name }}</div>
                        </div>
                      </div>
                  </details>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>