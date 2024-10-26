<template>
  <div>
    <ActivitiesContainerComponent/>
  </div>
</template>

<script setup lang="ts">
import ActivitiesContainerComponent from '~/components/activitiesContainerComponent.vue'

useHead({
  title: 'Activities',
  meta: [
    {name: 'Street art', content: 'activities'}
  ],
})
</script>