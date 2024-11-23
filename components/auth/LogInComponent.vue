<script setup lang="ts">
import {useAuthStore} from '~/stores/authStore/useAuthStore'

const authStore = useAuthStore()
onMounted(() => {
  authStore.loginErrorMessage = ''
})
const email = ref<string>('')
const password = ref<string>('')
const isLoading = ref(false)

async function onSubmit() {
  if(!email.value || !password.value) {
    authStore.loginErrorMessage = 'Please fill all fields'

    return
  }

  isLoading.value = true
  await authStore.logIn(email.value, password.value)
  isLoading.value = false
}
</script>

<template>
  <div class="_container">
    <v-alert
      v-if="authStore.loginErrorMessage"
      title="Log in failed"
      :text="authStore.loginErrorMessage"
      type="error"
      class="alert-error"
    ></v-alert>
    <div class="form-container">
      <div>
        <div class="form-item-container">
          <v-text-field
              v-model="email"
              label="E-mail"
              variant="solo"
              density="compact"
          ></v-text-field>
        </div>
        <div class="form-item-container">
          <v-text-field
              v-model="password"
              type="password"
              label="Password"
              variant="solo"
              density="compact"
          ></v-text-field>
        </div>
        <v-btn
            :loading="isLoading"
            class="me-4 submit-button"
            type="submit"
            @click="onSubmit"
        >
          log in
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.submit-button{
  background: #000;
  color: white;
}

.alert-error{
  margin-bottom: 18px;
}
</style>