<script setup>
const props = defineProps({
  headerIcon: String | undefined,
  headerTitle: String
});
</script>
<template>
  <header class="title-bar">
    <div class="title">
      <span v-if="props.headerIcon" class="material-icons" style="vertical-align: -5px">
        {{ props.headerIcon }}
      </span>
      {{ props.headerTitle }}
    </div>
  </header>
</template>