import { defineStore } from 'pinia';
import { doc, getDoc } from "firebase/firestore";
import {ref} from 'vue';
import { useNuxtApp } from '#build/imports';
import {getAuth, signInWithEmailAndPassword, signOut} from 'firebase/auth'
import { useAddCommentStore } from "~/stores/addComment";
import type {IUser} from '~/stores/authStore/types/IUser'
import {LocalStorageVariables} from '~/types/LocalStorageVariablesType'

export const useAuthStore = defineStore('auth', () => {
    const auth = getAuth()
    const {$firestore}: any = useNuxtApp()
    const addCommentStore = useAddCommentStore()
    const userInfo = reactive<IUser>({
        email: '',
        uid: '',
        role: '',
        name: '',
    })
    const isLoggedIn = ref<boolean>(false)
    const loginErrorMessage = ref<string>('')
    const savedActivityIds = reactive<string[]>([])

    async function logIn(email:string, password:string, ) {
        try{
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            if (user && user.emailVerified) {
                const userData = await getUserData(user.uid)
                if(!userData) {
                    loginErrorMessage.value = 'User does`t exist'
                    return
                }

                userInfo.uid = user.uid
                userInfo.email = user.email || ''
                userInfo.name = userData.name
                userInfo.role = userData.role
                loginErrorMessage.value = ''
                isLoggedIn.value = true
                addCommentStore.showFirebaseAuthComponent = false
                localStorage.setItem(LocalStorageVariables.UserUid, user.uid)
                localStorage.setItem(LocalStorageVariables.UserRole, userData.role)

                if(addCommentStore.logInDuringAddingComment) {
                    addCommentStore.showAddCommentComponent = true;
                }
            }
            //  якщо користуач створив акаунт та не підтвердив мейл
            else if (user && !user.emailVerified) {
                signOut(auth).then(() => {
                    loginErrorMessage.value = 'Please verify your e-mail to log in';
                })
            }else{
                signOut(auth).then(() => {
                    loginErrorMessage.value = 'Invalid e-mail or password';
                }).catch((error) => {
                    // An error happened.
                    console.error('Sign out error:', error)
                });
            }
        } catch (error){
            console.log(error);
            loginErrorMessage.value = 'Invalid e-mail or password'
        }
    }

    async function getUserData(userUid: string) {
        const docRef = doc($firestore, "users", userUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            if(docSnap.data().savedActivities) {
              // @ts-ignore  
              docSnap.data().savedActivities.map(activity => {
                savedActivityIds.push(activity)
              })
            }

            return docSnap.data()
        } else {
            console.log("User does`t exist");
            return
        }
    }

    async function logOut() {
        isLoggedIn.value = false
        userInfo.uid = ''
        userInfo.email = ''
        userInfo.name = ''
        userInfo.role = ''
        savedActivityIds.length = 0

        await signOut(auth)
        localStorage.removeItem(LocalStorageVariables.UserUid)
        localStorage.removeItem(LocalStorageVariables.UserRole)
        addCommentStore.showAddCommentComponent = false
        navigateTo('/userComponent')
    }

    return {
        isLoggedIn,
        loginErrorMessage,
        userInfo,
        savedActivityIds,
        logIn,
        logOut,
        getUserData,
    }
})
