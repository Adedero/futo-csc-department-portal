<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const { data } = await useGet('/api/hod/dashboard-info', { router, toast })
</script>

<template>
  <main class="h-full overflow-y-auto w-full p-2">
    <VCard>
      <h1 class="font-bold text-xl">Dashboard</h1>
    </VCard>

    <section class="mt-2 grid gap-2 md:grid-cols-6">
      <VCard class="md:col-span-3 lg:col-span-4 flex items-center gap-2">
        <div class="w-28">
          <VAvatar :image="userStore.user.image" rounded fluid />
        </div>

        <div>
          <p>
            Welcome, <span class="font-semibold text-lg">{{ userStore.user.title }}</span>
          </p>
          <p class="text-2xl font-semibold text-[--p-primary-500]">{{ userStore.user.name }}</p>
          <p class="text-xs text-slate-600">HOD, CSC</p>
        </div>
      </VCard>

      <VCard class="md:col-span-3 lg:col-span-2 flex items-center">
        <div
          class="w-24 h-24 rounded-xl grid place-content-center text-white bg-[--p-primary-color]"
        >
          <span class="pi pi-users" style="font-size: 2.5rem"></span>
        </div>
        <Divider layout="vertical" />
        <div>
          <div>
            <h1 class="font-semibold">Staffs:</h1>
            <h1 class="text-2xl font-bold">{{ data.staffs }}</h1>
          </div>
        </div>
      </VCard>

      <VCard class="md:col-span-2 flex items-center">
        <div class="w-24 h-24 rounded-xl grid place-content-center text-white bg-[--p-red-500]">
          <span class="pi pi-folder-open" style="font-size: 2.5rem"></span>
        </div>
        <Divider layout="vertical" />
        <div>
          <div>
            <h1 class="font-semibold">Pending Results:</h1>
            <h1 class="text-2xl font-bold">{{ data.pendingResults }}</h1>
          </div>
        </div>
      </VCard>

      <VCard class="md:col-span-2 flex items-center">
        <div>
          <CalendarIcon />
        </div>
        <Divider layout="vertical" />
        <div>
          <h1 class="font-semibold">Session</h1>
          <h1 class="text-xl font-bold">{{ data.currentSession.name }}</h1>
        </div>
      </VCard>

      <VCard class="md:col-span-2 flex items-center">
        <div>
          <img
            v-if="data.currentSemester.name === 'RAIN'"
            src="../../assets/img/rain.svg"
            alt="rain"
            class="h-24"
          />
          <img v-else src="../../assets/img/harmattan.svg" alt="harmattan" class="h-24" />
        </div>
        <Divider layout="vertical" />
        <div>
          <h1 class="font-semibold">Semester</h1>
          <h1 class="text-xl font-bold">{{ data.currentSemester.name }}</h1>
        </div>
      </VCard>
    </section>

    <VCard class="mt-2">
      <h1 class="font-bold">Advisors: {{ 4 }}</h1>
      <Divider />
      <div class="w-full overflow-auto">
        <DataTable :value="data.advisors" size="small" dataKey="_id" tableStyle="min-width: 0">
          <Column field="image" style="min-width: 5rem">
            <template #body="slotProps">
              <div class="w-12 h-12 overflow-hidden rounded-full">
                <VAvatar :image="slotProps.data.user.image" rounded />
              </div>
            </template>
          </Column>

          <Column field="user.name" header="Name"></Column>

          <Column field="studentClass.className" header="Class"></Column>
        </DataTable>
      </div>
    </VCard>
  </main>
</template>
