<script setup lang="ts">
import ActivitiesContainerComponent from '~/components/activitiesContainerComponent.vue'
</script>

<template>
  <div class="_container">
    <div class="title-container">
      <h2 class="title">My activities</h2>
    </div>
    <ActivitiesContainerComponent
      :showArtistActivities="true"
    />
  </div>
</template>

<style scoped>
.title-container{
  display: flex;
  justify-content: center;
  margin: 20px 0 -10px 0;
}
</style>