<script setup>
import { ref } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const pin = ref('')
const loading = ref(false)
const verify = () => {}
</script>

<template>
  <AuthLayout>
    <template #content>
      <div class="grid place-content-center mt-10 px-5 lg:place-content-start lg:px-10">
        <h1 class="text-2xl font-bold text-center lg:text-left">Register</h1>

        <p class="mt-2 text-center lg:text-left text-sm">
          Already got an account? <br class="lg:hidden" />
          <RouterLink to="/" class="font-semibold text-blue-500">Log in</RouterLink> instead.
        </p>

        <div
          class="grid gap-4 mt-4 w-fit bg-white bg-opacity-40 backdrop-blur-sm shadow p-5 rounded-md lg:p-0 lg:bg-transparent lg:backdrop-blur-0 lg:shadow-none lg:w-96"
        >
          <h1 class="font-semibold">Enter the PIN provided to you.</h1>

          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-lock"></i>
            </InputGroupAddon>
            <InputText type="text" v-model.trim="pin" placeholder="Enter PIN" />
          </InputGroup>

          <Button @click="verify" :loading label="Verify" icon="pi pi-check-circle" />
        </div>
      </div>
    </template>

    <template #image>
      <div class="h-full w-full overflow-hidden">
        <img
          src="../../assets/img/students/student-2.jpg"
          alt="student"
          class="h-full w-full object-cover"
        />
      </div>
    </template>
  </AuthLayout>
</template>
