import {useAuthStore} from '~/stores/authStore/useAuthStore'

export default defineNuxtRouteMiddleware((to, from) => {
    // todo: set user role to localstorage after logIn
    // todo: delete user role from localstorage after logout
    //const authStore = useAuthStore()

    // if (to.path == '/savedActivitiesPage') {
    //     if (!authStore.isLoggedIn) {
    //         return navigateTo('/userComponent');
    //     }
    // }
    //
    // if (to.path.startsWith('/admin')) {
    //     if (authStore.userInfo.role != 'artist' || !authStore.isLoggedIn) {
    //         return navigateTo('/userComponent')
    //     }
    // }
})




