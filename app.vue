<template>
  <NuxtLayout>
    <div class="wrapper">
      <HeaderComponent></HeaderComponent>
      <NuxtPage/>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {getAuth, onAuthStateChanged, type User} from 'firebase/auth'
import {useAuthStore} from '~/stores/authStore/useAuthStore'

useSeoMeta({
  title: 'Street art',
  ogTitle: 'Street art',
  description: 'This is my amazing street art application.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

const auth = getAuth()
const authStore = useAuthStore()

onAuthStateChanged(auth, async(user: User) => {
  if (user && user.emailVerified) {
    authStore.isLoggedIn = true
    authStore.userInfo.uid = user.uid
    authStore.userInfo.email = user.email || ''

    const userData = await authStore.getUserData(user.uid)
    if(!userData) return

    authStore.userInfo.name = userData.name
    authStore.userInfo.role = userData.role
  }
})
</script>