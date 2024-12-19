<script setup lang="ts">
import {getAuth, onAuthStateChanged, type User} from 'firebase/auth'
import {useAuthStore} from '~/stores/authStore/useAuthStore'
import { useAddCommentStore } from "~/stores/addComment"
import FirebaseAuthComponent from './components/auth/FirebaseAuthComponent.vue'


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

onAuthStateChanged(auth, async(user) => {
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

const addCommentStore = useAddCommentStore()
const {showFirebaseAuthComponent} = storeToRefs(addCommentStore)
watch(showFirebaseAuthComponent, (newValue) => {
  if(newValue){
    document.documentElement.classList.add('no-scroll');
  }else{
    document.documentElement.classList.remove('no-scroll');
  }
})
</script>

<template>
  <NuxtLayout>
    <div class="wrapper">
      <HeaderComponent></HeaderComponent>
      <NuxtPage/>
      <div v-if="showFirebaseAuthComponent" class="auth-component-container">
        <FirebaseAuthComponent/>
      </div>
      <div v-if="showFirebaseAuthComponent" class="overlay" @click="addCommentStore.showFirebaseAuthComponent = false"/>  
    </div>
  </NuxtLayout>
</template>

<style lang="scss">
.auth-component-container{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  z-index: 1001;
}

.overlay {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.4);
  z-index: 1000;
  top: 0;
  left: 0;
}
</style>