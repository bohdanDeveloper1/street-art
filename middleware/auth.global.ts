import {LocalStorageVariables} from '~/types/LocalStorageVariablesType'
import {RoleType} from '~/types/RoleType'

export default defineNuxtRouteMiddleware((to, from) => {
    const role = localStorage.getItem(LocalStorageVariables.UserRole)

    if (to.path.startsWith('/artist')) {
        if (role !== RoleType.Artist) {
            return navigateTo('/userComponent')
        }
    }
})




