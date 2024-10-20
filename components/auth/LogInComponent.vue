<script setup lang="ts">
import {useField, useForm} from "vee-validate";
import {useAuthStore} from '~/stores/authStore/useAuthStore'

const authStore = useAuthStore()
const router = useRouter();

// regex validation
const uppercaseRegex = /[A-Z]/; // Велика літера
const lowercaseRegex = /[a-z]/; // Мала літера
const digitRegex = /\d/; // Цифра

// validation rules
const {handleSubmit} = useForm({
  validationSchema: {
    email (value) {
      if (/.+@.+\..+/.test(value)) return true

      return 'Please enter valid email.'
    },
    password(value) {
      if (value?.length < 8 || !uppercaseRegex.test(value) || !lowercaseRegex.test(value) || !digitRegex.test(value)){
        return 'Password must have: uppercase letter, lowercase letter, one digit, min 8 characters';
      }

      return true;
    }
  },
})
const email: any = useField('email');
const password: any = useField('password');
const isLoading = ref(false);

const submit = handleSubmit(async (values) => {
  isLoading.value = true

  await authStore.logIn(email.value.value, password.value.value)
  isLoading.value = false
})
</script>

<template>
  <div class="_container">
    <v-alert
        v-if="authStore.isProblemWithLogIn"
        title="Log in failed"
        :text="authStore.loginErrorMessage"
        type="error"
        class="alert-error"
    ></v-alert>
    <div class="form-container">
      <form>
        <!--  E-mail -->
        <div class="form-item-container">
          <v-text-field
              v-model="email.value.value"
              :error-messages="email.errorMessage.value"
              label="E-mail"
              variant="solo"
              density="compact"
          ></v-text-field>
        </div>

        <!--  Password -->
        <div class="form-item-container">
          <v-text-field
              v-model="password.value.value"
              :error-messages="password.errorMessage.value"
              type="password"
              label="Password"
              variant="solo"
              density="compact"
          ></v-text-field>
        </div>

        <!-- Submit -->
        <v-btn
            :loading="isLoading"
            class="me-4 submit-button"
            type="submit"
            @click="submit"
        >

          log in
        </v-btn>
      </form>
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