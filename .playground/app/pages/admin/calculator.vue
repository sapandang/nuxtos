<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()
const launchQuery = computed(() => route.query)
</script>

<template>
  <DesktopShell initial-app-id="calculator" :initial-app-query="launchQuery" />
</template>
