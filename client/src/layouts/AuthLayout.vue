<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import studentImage from '@/assets/img/students/student-1.jpg'

const router = useRouter()

const menu = ref(null)
const items = ref([
  {
    label: 'Menu',
    items: [
      {
        label: 'Login',
        icon: 'pi pi-sign-in',
        command: () => router.push({ name: 'login' })
      },
      {
        label: 'Register',
        icon: 'pi pi-user-plus',
        command: () => router.push({ name: 'login' })
      }
    ]
  }
])

const toggle = (event) => {
  menu.value.toggle(event)
}
</script>

<template>
  <main class="relative h-dvh overflow-hidden lg:flex">
    <div class="absolute w-48 xl:w-56 -z-10 -left-10 -bottom-20 aspect-square bg-red-500 rounded-full"></div>
    <div class="absolute w-28 xl:w-36 -z-10 -right-10 bottom-[40%] lg:left-[50%] lg:-bottom-16 aspect-square bg-sky-500 rounded-full"></div>
    <div class="hidden lg:block absolute w-24 h-12 xl:h-16 xl:w-32 -z-10 top-20 left-[40%] bg-emerald-500 rounded-b-full"></div>

    <SchoolIconOne class="absolute bottom-5 left-12" />
    <SchoolIconTwo
      width="80px"
      height="80px"
      class="absolute -left-10 opacity-40 top-[40%] lg:top-[unset] lg:bottom-20 lg:left-[40%] -rotate-45"
    />

    <section class="lg:w-[60%] flex-shrink-0">
      <header class="px-5 py-5 flex items-center justify-between lg:px-10">
        <div class="flex items-center gap-2 lg:gap-5">
          <LogoDots />
          <p class="text-sm md:text-base font-semibold">Department of Computer Science, FUTO</p>
        </div>

        <div class="md:hidden">
          <Button @click="toggle" icon="pi pi-ellipsis-v" />
          <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
        </div>

        <div class="hidden md:flex items-center gap-3">
          <RouterLink to="/">Login</RouterLink>
          <div class="h-5 w-[3px] bg-slate-300"></div>
          <RouterLink to="/register">Register</RouterLink>
        </div>
      </header>

      <div>
        <div class="px-5 lg:px-10">
          <div class="flex items-center gap-1 justify-center lg:justify-normal">
            <NacosLogo width="40" />
            <p class="text-sm font-bold">Federal University of Technology, Owerri</p>
          </div>
        </div>

        <div
          class="text-center lg:text-left px-5 lg:px-10 grid gap-4 text-xl md:text-2xl lg:gap-8 xl:gap-10 lg:text-[2.1rem] xl:text-[2.5rem] font-bold text-slate-800"
        >
          <p>
            <span class="p-1.5 bg-sky-500">Computer Science</span>
            <span class="p-1.5 bg-red-500">Students'</span>
          </p>
          <p>
            <span class="p-1.5 bg-amber-500">Result</span>
            <span class="p-1.5 bg-emerald-500">Portal</span>
          </p>
        </div>
      </div>

      <slot name="content"></slot>
    </section>

    <section class="hidden w-4 lg:grid grid-rows-4 flex-shrink-0">
      <div class="bg-sky-500"></div>
      <div class="bg-red-500"></div>
      <div class="bg-amber-500"></div>
      <div class="bg-emerald-500"></div>
    </section>

    <section class="hidden lg:block lg:flex-grow flex-shrink-0">
      <slot name="image">
        <div class="h-full w-full overflow-hidden">
          <img
            :src="studentImage"
            alt="student"
            class="h-full w-full object-cover"
          />
        </div>
      </slot>
    </section>
  </main>
</template>

<style scoped>
a.router-link-exact-active {
  @apply font-bold;
}
</style>
