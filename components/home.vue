<script setup>
import {ref} from 'vue'
const router = useRouter()
const props = defineProps({
  originStationName: String,
  originStationId: Number,
  destinationStationName: String,
  destinationStationId: Number
});

// router.addRoute({name: 'searchRoute', path: '/pages/select_station', component: home})
let showInvaridMessage = ref(false)
let useBulletTrain = ref(true), useJR = ref(true), usePrivateTrain = ref(true), useSubwayAndMonorail = ref(true)
let transferTime = ref(5)
let mode = ref(1)

const routeSearch = () => {
  const params = {
    requestType: 'stationsAndLines',
    useBulletTrain: useBulletTrain.value,
    useJR: useJR.value,
    usePrivateTrain: usePrivateTrain.value,
    useSubwayAndMonorail: useSubwayAndMonorail.value,
    transferTime: transferTime.value,
    mode: mode.value
  }
  const query = new URLSearchParams(params)
  if (!props.originStationId || !props.destinationStationId) {
    showInvaridMessage.value = true
    return
  }
  console.log(query)
  router.push({ path: `/route/${props.originStationId}/${props.destinationStationId}`, query: params })
}
</script>


<template>
  <div id="search_page" class="main-panel-page">
    <div class="title-bar">
      <div class="title">
        <span class="material-icons" style="vertical-align: -5px">train</span
        >乗り換え検索 {{des}}
      </div>
    </div>

    <div id="search_box_container">
      <div
        class="station-search-box"
        @click="$emit('origin-station-clicked', 'origin')"
      >
        <div class="label start-station-label">出発駅</div>
        <div id="start_station_input" class="station-input">
          <span v-if="originStationName">{{ originStationName }}</span>
          <span v-else class="placeholder">駅を検索</span>
        </div>
      </div>
      <div
        class="station-search-box"
        @click="$emit('origin-station-clicked', 'destination')"
      >
        <div class="label goal-station-label">到着駅</div>
        <div id="goal_station_input" class="station-input">
          <span v-if="destinationStationName">{{
            destinationStationName
          }}</span>
          <span v-else class="placeholder">駅を検索</span>
        </div>
      </div>
      <p v-if="showInvaridMessage" class="invalid-message">駅を指定してください</p>
      <button @click="routeSearch" id="station_search_button">
        <span class="material-icons" style="vertical-align: -3px">search</span
        >検索
      </button>
      <details open>
        <summary>詳細設定</summary>
        <div id="search_settings">
          <div>使用する交通手段</div>
          <div>
            <input v-model="useBulletTrain"
              type="checkbox"
              id="check_bullet"
              name="check_bullet"
              checked
            />
            <label for="check_bullet">新幹線</label>
          </div>
          <div>
            <input v-model="useJR" type="checkbox" id="check_JR" name="check_JR" checked />
            <label for="check_JR">JR在来線</label>
          </div>
          <div>
            <input v-model="usePrivateTrain"
              type="checkbox"
              id="check_private_train"
              name="check_private_train"
              checked
            />
            <label for="check_private_train">私鉄</label>
          </div>
          <div>
            <input v-model="useSubwayAndMonorail"
              type="checkbox"
              id="check_subway_monorail"
              name="check_subway_monorail"
              checked
            />
            <label for="check_subway_monorail">地下鉄・モノレール</label>
          </div>
          <div>
            乗り換え時間(分)<input 
              type="number"
              id="transfer_time"
              value="5"
              min="0"
              step="1"
            />
          </div>
          <div>検索条件</div>
          <div>
            <div>
              <input
                type="radio"
                name="transfer_level"
                value="fast"
              />所要時間が短い(乗り換え時間除く)
            </div>
            <div>
              <input
                type="radio"
                name="transfer_level"
                value="medium"
                checked
              />ふつう
            </div>
            <div>
              <input
                type="radio"
                name="transfer_level"
                value="easy"
              />乗り換えが少ない
            </div>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
</style>