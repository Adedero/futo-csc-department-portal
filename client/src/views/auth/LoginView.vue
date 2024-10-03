<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToast } from 'vue-toast-notification'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { usePost } from '@/composables/server/use-fetch'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const user = reactive({})

const loading = ref(false)

const login = async () => {
  if (!user.username || !user.password) return
  loading.value = true
  await usePost('/auth/sign-in', { body: user, router, toast }, (data) => {
    userStore.setUser(data.user)
    userStore.setToken(data.token)

    const { role } = data.user

    switch (role) {
      case 'ADMIN':
        router.push('/admin')
        break
      case 'HOD':
        router.push('/hod')
        break
      case 'DEAN':
        router.push('/dean')
        break
      case 'ADVISOR':
        router.push('/advisor')
        break
      case 'STAFF':
        router.push('/staff')
        break
      case 'STUDENT':
        router.push('/student')
        break
      default:
        router.push('/')
    }
    ;(user.username = ''), (user.password = '')
  })
  loading.value = false
}
</script>

<template>
  <AuthLayout>
    <template #content>
      <div class="grid place-content-center mt-10 px-5 lg:place-content-start lg:px-10">
        <h1 class="text-2xl font-bold text-center lg:text-left">Login</h1>

        <p class="mt-2 text-center lg:text-left text-sm">
          Don't have an account? <br class="lg:hidden" /><RouterLink
            to="/register"
            class="font-semibold text-blue-500"
            >Register</RouterLink
          >
          with your PIN.
        </p>

        <div
          class="grid gap-4 mt-4 w-fit bg-white bg-opacity-40 backdrop-blur-sm shadow p-5 rounded-md lg:p-0 lg:bg-transparent lg:backdrop-blur-0 lg:shadow-none lg:w-96"
        >
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-user"></i>
            </InputGroupAddon>
            <InputText type="text" v-model.trim="user.username" placeholder="Username or email" />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-lock"></i>
            </InputGroupAddon>
            <Password
              v-model.trim="user.password"
              placeholder="Password"
              toggleMask
              :feedback="false"
            />
          </InputGroup>

          <router-link to="/" class="hover:text-blue-500 hover:underline">
            Forgot password?
          </router-link>

          <Button @click="login" :loading label="Log in" icon="pi pi-sign-in" icon-pos="right" />
        </div>
      </div>
    </template>
  </AuthLayout>
</template>
