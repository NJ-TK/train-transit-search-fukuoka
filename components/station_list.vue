<script setup>
import {ref} from 'vue'
const runtimeConfig = useRuntimeConfig();
console.log(runtimeConfig.public.STATION_LIST_API_ENDPOINT)

// const { data: count } = await useFetch(runtimeConfig.STATION_LIST_API_ENDPOINT)

</script>

<template>
    <div id="station_search_page" class="main-panel-page">
        <div class="station-search-input-container">
            <div id="station_search_back_button" class="material-icons" @click="$emit('back-button-clicked')">arrow_back</div>
            <input type="text" id="station_search_input" placeholder="駅名を入力" autocomplete="off">
        </div>
        <div id="station_search_result">
            <!-- {{count}} -->
        </div>
    </div>
</template>