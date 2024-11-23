<script setup lang="ts">
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification  } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {PasswordErrorType} from '~/components/auth/types/PasswordErrorType'
import {DomEvent} from 'leaflet'
import preventDefault = DomEvent.preventDefault

const auth = getAuth();
const { $firestore } = useNuxtApp();
const isAccountCreatedSuccessfully = ref(false)

const email = ref<string>('')
const triggerEmailValidation = ref<boolean>(false)
const emailErrorMessage = ref<string>('')
function validateEmail(startValidation?: boolean) {
  if(startValidation) triggerEmailValidation.value = true

  if(triggerEmailValidation.value) {
    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailErrorMessage.value = ''
    } else {
      emailErrorMessage.value = 'Incorrect email'
    }
  }
}

const name = ref<string>('')
const triggerNameValidation = ref<boolean>(false)
const nameErrorMessage = ref<string>('')
function validateName(startValidation?: boolean) {
  if(startValidation) triggerNameValidation.value = true

  if(triggerNameValidation.value) {
    if(name.value.length >= 2) {
      nameErrorMessage.value = ''
    } else {
      nameErrorMessage.value = 'Invalid name'
    }
  }
}

const passwordErrors = reactive<PasswordErrorType[]>([])
const password = ref<string>('')
const triggerPasswordValidation = ref<boolean>(false)
function validatePassword(startValidation?: boolean) {
  if(startValidation) triggerPasswordValidation.value = true

  if(triggerPasswordValidation.value) {
    passwordErrors.length = 0

    if(password.value.length < 8) {
      passwordErrors.push(PasswordErrorType.LessThan8Characters)
    }

    if(!/[a-z]/.test(password.value)) {
      passwordErrors.push(PasswordErrorType.NoLowercaseLetter)
    }

    if(!/[A-Z]/.test(password.value)) {
      passwordErrors.push(PasswordErrorType.NoUppercaseLetter)
    }

    if(!/[\d]/.test(password.value)) {
      passwordErrors.push(PasswordErrorType.NoDigit)
    }

    if(!/[!@#$%^&*.?]/.test(password.value)) {
      passwordErrors.push(PasswordErrorType.NoSpecialCharacter)
    }
  }
}
const passwordValidationMessagesMap = [
  {
    type: PasswordErrorType.LessThan8Characters,
    message: 'At least 8 characters',
  },
  {
    type: PasswordErrorType.NoUppercaseLetter,
    message: 'At least one uppercase letter**(A-Z)',
  },
  {
    type: PasswordErrorType.NoLowercaseLetter,
    message: 'At least one lowercase letter**(a-z)',
  },
  {
    type: PasswordErrorType.NoDigit,
    message: 'At least one digit**(0-9)',
  },
  {
    type: PasswordErrorType.NoSpecialCharacter,
    message: 'At least one special character**(e.g., ! @ # $ % ^ & *)',
  },
]

const userRole = ref('user')
const errorMessage = ref('')
const isProblemWithAccountCreating = ref(false);
async function onSubmit() {
  validateEmail(true)
  validateName(true)
  validatePassword(true)

  if(!emailErrorMessage.value && !nameErrorMessage.value && passwordErrors.length === 0) {
    await createAccount()
  }
}
const isLoading = ref(false)

async function createAccount() {
  try {
    isLoading.value = true;
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)

    // Відправлення листа для підтвердження email
    if(auth.currentUser) {
      await sendEmailVerification(auth.currentUser)
    }

    // Оновлення стану про успішне створення акаунту
    isProblemWithAccountCreating.value = false;
    isAccountCreatedSuccessfully.value = true;

    // Отримую користувача
    const user = userCredential.user;

    // Додаю користувача до бази даних
    await addUserToDataBase(user);
    isLoading.value = false;
  } catch (error) {
    isProblemWithAccountCreating.value = true;
    errorMessage.value = error.message;
    isLoading.value = false;
  }
}

async function addUserToDataBase(user) {
  await setDoc(doc($firestore, "users", user.uid), {
    name: name.value,
    role: userRole.value,
  })
  }
</script>

<template>
  <div class="_container">
    <div class="form-container" v-if="!isAccountCreatedSuccessfully">
      <v-alert
          v-if="isProblemWithAccountCreating"
          title="Account was`t created"
          :text="errorMessage"
          type="error"
          class="alert-error"
      ></v-alert>
      <div>
        <div class="form-inputs-wrapper">
          <div class="form-item-container">
            <v-text-field
                v-model="name"
                :error-messages="nameErrorMessage"
                @input="validateName(false)"
                @blur="validateName(true)"
                label="Name"
                variant="solo"
                density="compact"
            ></v-text-field>
          </div>
          <div class="form-item-container">
            <v-text-field
                v-model="email"
                :error-messages="emailErrorMessage"
                @input="validateEmail(false)"
                @blur="validateEmail(true)"
                label="E-mail"
                variant="solo"
                density="compact"
            ></v-text-field>
          </div>
          <div class="form-item-container">
            <v-text-field
                v-model="password"
                @input="validatePassword(false)"
                @blur="validatePassword(true)"
                type="password"
                label="Password"
                variant="solo"
                density="compact"
            />
            <div class="validation-message-container">
              <div
                  v-for="{type, message} in passwordValidationMessagesMap"
                  :key="type"
                  class="validation-message"
                  :class="{'error': triggerPasswordValidation && passwordErrors.includes(type), 'success': triggerPasswordValidation && !passwordErrors.includes(type)}"
              >
<!--                <IconComponent-->
<!--                    :name="passwordErrors.includes(type) ? IconNameType.Dash : IconNameType.Check"-->
<!--                    :size="SizeVariantType.Standard"-->
<!--                    :color="passwordErrors.includes(type) ? themeVariablesMap.get(ThemeVariableType.Error) as string : themeVariablesMap.get(ThemeVariableType.Violet350) as string"-->
<!--                />-->
                {{message}}
              </div>
            </div>
          </div>
        </div>
        <v-radio-group v-model="userRole" inline>
          <v-radio label="user account" value="user"></v-radio>
          <v-radio label="artist account" value="artist"></v-radio>
        </v-radio-group>
        <v-btn
            :loading="isLoading"
            class="me-4 submit-button"
            type="submit"
            @click="onSubmit"
        >
          create an account
        </v-btn>
      </div>
    </div>
    <div class="account-created-container" v-else>
      <div class="account-created-img-container">
        <img class="email-icon" src="/images/emailIcon.png" alt="email verification">
      </div>
      <h2>Verify your e-mail to log in.</h2>
      <h5>We sent an e-mail with a confirmation link.</h5>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .form-inputs-wrapper{
    display: flex;
    flex-direction: column;
    gap: 8px
  }

  .validation-message-container{
     display: flex;
     flex-direction: column;
     gap: 4px;
     margin-top: -12px;
     .validation-message{
       display: flex;
       align-items: center;
       gap: 4px;
       font-size: 14px;
       font-weight: 400;
       line-height: 125%;
       color: #69717d;
       &.error{
         color: red;
       }
       &.success{
         color: green;
       }
     }
  }

  .submit-button{
    background: #000;
    color: white;
  }

  .alert-error{
    margin-bottom: 18px;
  }

  .account-created-container{
    margin: 25px auto 0 auto;
    padding: 0 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 450px;
  }

  .account-created-img-container{
    margin-bottom: 20px;
  }

  .email-icon{
    width: 150px;
    height: 150px;
  }
</style>