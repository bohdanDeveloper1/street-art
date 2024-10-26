<template>
<div>
  <div
    class="header"
    :class="{'show-sidebar': showSidebar}"
  >
    <div class="_container header-wrapper">
      <div class="left-section-container">
        <ul class="links-list">
          <li>
            <NuxtLink to="/" class="header-item header-item-brand">
              Street art
              <img class="app-logo-img" src="/images/street-art-logo.jpg" alt="logo">
            </NuxtLink>
          </li>
          <li v-if="false">
            <NuxtLink to="/savedActivitiesPage" class="header-item">Saved activities</NuxtLink>
          </li>
          <li v-if="userInfo.role === 'artist'">
            <NuxtLink to="/admin/myActivities" class="header-item">My activities</NuxtLink>
          </li>
          <li v-if="userInfo.role === 'artist'">
            <NuxtLink to="/admin/addActivity" class="header-item">Add activity</NuxtLink>
          </li>
        </ul>
      </div>
      <div class="right-section-container">
        <ul class="links-list">
          <li v-if="userInfo.role">
            <NuxtLink to="/userComponent" class="header-item">
              <img src="/images/userIcon.svg" alt="user">
            </NuxtLink>
          </li>
          <li v-else>
            <NuxtLink to="/userComponent" class="header-item">Log in</NuxtLink>
          </li>
          <li v-if="userInfo.role">
            <div class="header-item" @click="logOut">Log out</div>
          </li>
        </ul>
        <div class="burger-menu-btn" @click="showSidebar = !showSidebar">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              v-if="!showSidebar"
          >
            <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"/>
          </svg>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              v-else
          >
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore/useAuthStore'
import {storeToRefs} from 'pinia'
import { useRouter } from 'vue-router'
import type {IUser} from '~/stores/authStore/types/IUser'
import {getAuth, onAuthStateChanged} from 'firebase/auth'

const auth = getAuth()
const authStore = useAuthStore()
const {userInfo}: IUser = storeToRefs(authStore)

async function logOut() {
  await authStore.logOut()
}

const showSidebar = ref<boolean>(false)
const router = useRouter();

watch(showSidebar, (value: boolean) => {
  if (value) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
})

// authentication state observer
onAuthStateChanged(auth, async(user) => {
  if (user && user.emailVerified) {
    authStore.isLoggedIn = true
    authStore.userInfo.uid = user.uid
    authStore.userInfo.email = user.email || ''

    const userData = await authStore.getUserData(user.uid)
    if(!userData) return

    authStore.userInfo.name = userData.name
    authStore.userInfo.role = userData.role
  } else {
    return
  }
})

router.afterEach(() => {
  showSidebar.value = false;
})
</script>

<style scoped lang="scss">
.header{
  width: 100vw;
  height: 88px;
  background-color: black;

  .header-wrapper{
    display: flex;
    height: 100%;
    justify-content: space-between;

    .right-section-container{
      display: flex;
    }
  }
}

.links-list{
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: start;

  li{
    align-items: center;
    &:not(:last-child) {
      margin-right: 18px;
    }

    .header-item{
      color: lightgray;
      font-size: 24px;
      cursor: pointer;

      &:hover{
        color: white;
      }
    }

    .header-item-brand{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 28px;
      color: white;
    }

    .app-logo-img{
      width: 48px;
      height: 48px;
      border-radius: 4px;
    }
  }
}

.router-link-active {
  color: white;
}

.burger-menu-btn{
  display: none;
  align-items: center;

  svg{
    path{
      fill: lightgray;
    }
  }
}

.no-scroll {
  overflow: hidden;
}
//////////////////////////////////////////////////// RWD
@media (max-width: 750px) {
  .links-list{
    li{
      .header-item{
        display: none;
      }

      .header-item-brand{
        display: flex;
      }
    }
  }

  .burger-menu-btn{
    display: flex;
  }

  .show-sidebar{
    height: 100vh;

    .header-wrapper{
      flex-direction: column;
      height: 100%;
      align-items: center;
      justify-content: start;
      padding-top: 32px;
    }

    .links-list{
      width: 100vw;
      flex-direction: column;
      gap: 20px;

      li{
        margin: 0 auto;

        .header-item{
          display: flex;
        }
      }
    }

    .burger-menu-btn{
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }
}

@media (max-width: 360px) {
  .links-list{
    li{
      .header-item-brand{
        font-size: 24px;
        gap: 8px;

        .app-logo-img{
          width: 36px;
          height: 36px;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>