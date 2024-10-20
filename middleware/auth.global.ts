import {useAuthStore} from '~/stores/authStore/useAuthStore'

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    if (to.path == '/savedActivitiesPage') {
        if (!authStore.isLoggedIn) {
            return navigateTo('/userComponent');
        }
    }

    if (to.path.startsWith('/admin')) {
        if (authStore.userInfo.role != 'artist' || !authStore.isLoggedIn) {
            return navigateTo('/userComponent');
        }
    }
})




