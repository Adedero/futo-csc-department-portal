<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const { data } = await useGet('/api/admin/dashboard-info', { router, toast })

const HOD = computed(() => data.value.leaders.find((leader) => leader.role === 'HOD'))
const dean = computed(() => data.value.leaders.find((leader) => leader.role === 'DEAN'))
</script>

<template>
  <main class="h-full overflow-y-auto w-full p-2">
    <VCard>
      <h1 class="font-bold text-xl">Dashboard</h1>
      <div class="flex items-center gap-2">
        <div class="bg-slate-400 w-12 overflow-hidden aspect-square rounded-full">
          <VAvatar :image="userStore.user.image" rounded />
        </div>
        <div class="grid">
          <p class="">
            Welcome,
            <span class="font-semibold text-[--p-primary-500]">{{ userStore.user.name }}</span>
          </p>
          <p class="text-xs text-slate-600">ADMINISTRATOR</p>
        </div>
      </div>
    </VCard>

    <section class="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard icon="pi pi-graduation-cap" label="classes" :value="data.classes" />
      <DashboardCard
        icon="pi pi-users"
        label="students"
        :value="data.students"
        bg-color="bg-sky-500"
        text-color="text-sky-500"
      />
      <DashboardCard
        icon="pi pi-briefcase"
        label="staff"
        :value="data.staffs"
        bg-color="bg-amber-500"
        text-color="text-amber-500"
      />
      <DashboardCard
        icon="pi pi-book"
        label="courses"
        :value="data.courses"
        bg-color="bg-emerald-500"
        text-color="text-emerald-500"
      />
    </section>

    <section class="mt-2 grid gap-2 md:grid-cols-2">
      <VCard>
        <h1 class="font-semibold">H.O.D</h1>
        <div class="flex items-center gap-2">
          <div class="rounded-full w-32 aspect-square bg-slate-300">
            <VAvatar :image="HOD.image" />
          </div>
          <div>
            <p v-if="HOD" class="font-semibold text-xl">{{ HOD.title + ' ' + HOD.name }}</p>
            <!-- <p>Ph.D., M.Sc., B.Sc.</p> -->
          </div>
        </div>
      </VCard>

      <VCard>
        <h1 class="font-semibold">Dean</h1>
        <div class="flex items-center gap-2">
          <div class="rounded-full w-32 aspect-square bg-slate-300">
            <VAvatar :image="dean.image" />
          </div>
          <div>
            <p v-if="dean" class="font-semibold text-xl">{{ dean.title + ' ' + dean.name }}</p>
            <!-- <p>Ph.D., M.Sc., B.Sc.</p> -->
          </div>
        </div>
      </VCard>
    </section>

    <section class="mt-2 grid lg:grid-cols-3 gap-2">
      <VCard>
        <h1 class="font-semibold">Session</h1>
        <div class="grid place-content-center text-center">
          <CalendarIcon class="mt-2" />
          <p class="mt-5 text-lg font-bold border-t border-b">{{ data.currentSession.name }}</p>
          <RouterLink :to="{ name: 'admin-settings' }" class="mt-2 hover:underline"
            >Edit in settings</RouterLink
          >
        </div>
      </VCard>

      <VCard>
        <h1 class="font-semibold">Semester</h1>
        <div class="grid place-content-center text-center mt-2">
          <img
            v-if="data.currentSemester.name === 'RAIN'"
            src="../../assets/img/rain.svg"
            alt="rain"
            class="h-24"
          />
          <img v-else src="../../assets/img/harmattan.svg" alt="harmattan" class="h-24" />
          <p class="mt-5 text-lg font-bold border-t border-b">{{ data.currentSemester.name }}</p>
          <RouterLink :to="{ name: 'admin-settings' }" class="mt-2 hover:underline"
            >Edit in settings</RouterLink
          >
        </div>
      </VCard>

      <VCard>
        <h1 class="font-semibold">Course Registration</h1>
        <div class="grid place-content-center text-center mt-2">
          <img src="../../assets/img/switch.svg" alt="switch" class="h-24" />
          <p class="mt-5 text-lg font-bold border-t border-b">
            {{ data.courseRegStatus.isOpen ? 'OPEN' : 'CLOSED' }}
          </p>
          <RouterLink :to="{ name: 'admin-settings' }" class="mt-2 hover:underline"
            >Edit in settings</RouterLink
          >
        </div>
      </VCard>
    </section>
  </main>
</template>
