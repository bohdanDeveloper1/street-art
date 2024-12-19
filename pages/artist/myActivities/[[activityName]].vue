<script setup lang="ts">
import ActivitiesContainerComponent from '~/components/activitiesContainerComponent.vue'

const route = useRoute()
const updatedActivityName = ref<string>('')
const showSuccessUpdateAlert = ref<boolean>(false)
onMounted(() => {
  if(route.params.activityName) {
    updatedActivityName.value = route.params.activityName as string
    showSuccessUpdateAlert.value = true
  }
})

watch(showSuccessUpdateAlert, (value) => {
  if(value) {
    setTimeout(() => showSuccessUpdateAlert.value = false, 3000)
  }
})
</script>

<template>
  <div class="_container">
    <v-alert
    :title="`${updatedActivityName} has been updated`"
    type="success"
    closable
    class="alert"
    v-if="showSuccessUpdateAlert"
  />
    <div class="title-container">
      <h2 class="title">My activities</h2>
    </div>
    <ActivitiesContainerComponent
      :showArtistActivities="true"
    />
  </div>
</template>

<style scoped lang="scss">
.title-container{
  display: flex;
  justify-content: center;
  margin: 20px 0 -10px 0;
}

._container{
  position: relative;
}

.alert{
  position: absolute;
  top: 10px;
  z-index: 9999;
}
</style>