<template>
  <div>
    <div class="not-auth-user-info" v-if="!authStore.isLoggedIn">
      <auth-firebase-auth-component></auth-firebase-auth-component>
    </div>
    <div v-else>
    <auth-signed-in-user-component></auth-signed-in-user-component>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore/useAuthStore'

const authStore = useAuthStore()
</script>