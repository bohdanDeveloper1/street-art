import { defineStore } from 'pinia';
import { doc, getDoc } from "firebase/firestore";
import {ref} from 'vue';
import { useNuxtApp } from '#build/imports';
import {getAuth, signInWithEmailAndPassword, signOut} from 'firebase/auth'
import { useAddCommentStore } from "~/stores/addComment";
import type {IUser} from '~/stores/authStore/types/IUser'

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
    const isProblemWithLogIn = ref<boolean>(false)
    const loginErrorMessage = ref<string>('')

    async function logIn(email:string, password:string, ) {
        try{
            // sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            if (user && user.emailVerified) {
                // отримую роль користувача
                const userData = await getUserData(user.uid)
                if(!userData) {
                    isProblemWithLogIn.value = true
                    loginErrorMessage.value = 'User does`t exist'

                    return
                }

                userInfo.uid = user.uid
                userInfo.email = user.email || ''
                userInfo.name = userData.name
                userInfo.role = userData.role

                isProblemWithLogIn.value = false
                loginErrorMessage.value = ''
                isLoggedIn.value = true

                if(addCommentStore.logInDuringAddingComment) {
                    addCommentStore.showFirebaseAuthComponent = false;
                    addCommentStore.showAddCommentComponent = true;
                }
            }
            //  якщо користуач створив акаунт та не підтвердив мейл
            else if (user && !user.emailVerified) {
                signOut(auth).then(() => {
                    isProblemWithLogIn.value = true;
                    loginErrorMessage.value = 'Please verify your e-mail to log in';
                })
            }else{
                signOut(auth).then(() => {
                    isProblemWithLogIn.value = true
                    loginErrorMessage.value = 'Invalid e-mail or password';
                }).catch((error) => {
                    // An error happened.
                    console.error('Sign out error:', error)
                });
            }
        } catch (error){
            console.log(error);
            isProblemWithLogIn.value = true
            loginErrorMessage.value = 'Invalid e-mail or password'
        }
    }

    async function getUserData(userUid: string) {
        const docRef = doc($firestore, "users", userUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
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

        await signOut(auth)
        addCommentStore.showAddCommentComponent = false
    }

    return {
        isLoggedIn,
        isProblemWithLogIn,
        loginErrorMessage,
        userInfo,
        logIn,
        logOut,
        getUserData,
    }
})
