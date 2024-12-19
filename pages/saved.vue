<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore/useAuthStore'
import {useFirebaseApiStore} from '~/stores/api/useFirebaseApiStore'
import type { IExtendedActivityData } from '~/types/IExtendedActivityData'

const authStore = useAuthStore()
const {savedActivityIds} = storeToRefs(authStore)
const firebaseApiStore = useFirebaseApiStore()
const savedActivities = ref()

async function getSavedActivities() {
  const getSavedActivitiesPromises = savedActivityIds.value.map(id =>
    firebaseApiStore.get<IExtendedActivityData>('activities', undefined, id)
  )

  savedActivities.value = await Promise.all(getSavedActivitiesPromises)
console.log(savedActivities.value)
console.log(typeof savedActivities.value)    
}

onMounted(async () => {
  if(savedActivityIds.value.length) {
    await getSavedActivities()
  }
})

watch(savedActivityIds.value, async (newValue) => {
    await getSavedActivities()
})

    // use v-for with activitiesContainer 
    // move getSavedActivities logic to activitiesContainer
</script>

<template>
<div>
  
</div>
</template>

<style scoped lang="scss">

</style>