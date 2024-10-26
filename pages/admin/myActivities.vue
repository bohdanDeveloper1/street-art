<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore/useAuthStore'
import type {IUser} from '~/stores/authStore/types/IUser'
import {storeToRefs} from 'pinia'

const authStore = useAuthStore()
const {userInfo}: IUser = storeToRefs(authStore)
</script>

<template>
  <div class="_container">
    <div class="title-container">
      <h2 class="title">My activities</h2>
    </div>
    <ActivitiesContainerComponent
      :showArtistActivities="true"
      :activityId="userInfo.uid"
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