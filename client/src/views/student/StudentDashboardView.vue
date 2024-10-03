<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const { data } = await useGet('/api/student/dashboard-info', { router, toast })
</script>

<template>
  <main class="h-full overflow-y-auto w-full p-2">
    <VCard>
      <h1 class="font-bold text-xl">Dashboard</h1>
      <div class="flex items-center gap-2">
        <div class="bg-slate-400 w-12 aspect-square rounded-full">
          <VAvatar :image="userStore.user.image" rounded />
        </div>
        <div class="grid">
          <p class="">
            Welcome,
            <span class="font-semibold text-[--p-primary-500]">{{ userStore.user.name }}</span>
          </p>
          <p class="text-xs text-slate-600">STUDENT</p>
        </div>
      </div>
    </VCard>

    <section class="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard icon="pi pi-star" label="cgpa" :value="data.CGPA || 0" />
      <DashboardCard
        icon="pi pi-book"
        label="registered courses"
        :value="data.registeredCourses"
        bg-color="bg-sky-500"
        text-color="text-sky-500"
      />
      <DashboardCard
        icon="pi pi-file"
        label="results"
        :value="data.results.length"
        bg-color="bg-amber-500"
        text-color="text-amber-500"
      />
      <DashboardCard
        icon="pi pi-refresh"
        label="references"
        :value="data.references"
        bg-color="bg-emerald-500"
        text-color="text-emerald-500"
      />
    </section>

    <section class="mt-2 grid gap-2 md:grid-cols-2">
      <VCard>
        <h1 class="font-semibold">Profile</h1>
        <div class="flex flex-wrap items-center md:flex-nowrap md:justify-normal gap-2">
          <div class="w-40 md:w-32 aspect-square bg-slate-300">
            <VAvatar :image="userStore.user.image" fluid />
          </div>
          <div class="text-center md:text-left">
            <h1 class="text-lg font-bold">{{ userStore.user.name }}</h1>
            <p class="font-medium">{{ data.student.regNumber }}</p>
            <Divider />
            <p class="text-sm">
              Class: <span class="font-semibold">{{ data.studentClass.className }}</span>
            </p>
            <p class="text-sm">
              Level: <span class="font-semibold">{{ data.studentClass.currentLevel }}</span>
            </p>
            <p class="text-sm">
              Advisor: <span class="font-semibold">{{ data.advisor }}</span>
            </p>
          </div>
        </div>
      </VCard>

      <VCard>
        <h1 class="font-semibold">General Info</h1>
        <div class="flex items-center gap-2">
          <div class="mt-2">
            <img
              v-if="data.currentSemester.name === 'RAIN'"
              src="../../assets/img/rain.svg"
              alt="rain"
              class="h-28"
            />
            <img v-else src="../../assets/img/harmattan.svg" alt="harmattan" class="h-28" />
          </div>

          <div class="text-center md:text-left">
            <h1 class="text-lg font-bold">Session {{ data.currentSession.name }}</h1>
            <Divider />
            <h1 class="text-lg font-bold">{{ data.currentSemester.name }}</h1>
          </div>
        </div>
      </VCard>
    </section>

    <VCard class="mt-2">
      <h1 class="font-semibold">Performance Overview</h1>
      <StudentCgpaChart :results="data.results" />
    </VCard>
  </main>
</template>
