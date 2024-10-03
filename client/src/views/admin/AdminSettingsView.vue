<script setup>
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useGet } from '@/composables/server/use-fetch'

const router = useRouter()
const toast = useToast()

const { data } = await useGet('/api/admin/get-settings', { router, toast });

const changeCurrentSession = (currentSession) => (data.value.currentSession = currentSession)

const changeCurrentSemester = (currentSemester) => (data.value.currentSemester = currentSemester)
</script>

<template>
  <main class="w-full h-full p-2 overflow-y-auto">
    <VCard class="h-fit">
      <h1 class="font-bold text-xl">Settings</h1>
    </VCard>

    <VCard class="mt-2">
      <div class="flex items-center gap-2">
        <span class="pi pi-calendar"></span>
        <h1 class="font-bold">Academic Calendar</h1>
      </div>

      <NewSessionForm class="mt-1" />

      <ChangeCurrentSessionForm
        :sessions="data.sessions"
        :currentSession="data.currentSession"
        @update-current-session="changeCurrentSession"
        class="mt-6"
      />

      <ChangeCurrentSemesterForm
        :currentSemester="data.currentSemester"
        @update-current-semester="changeCurrentSemester"
        class="mt-6"
      />

      <CourseRegStatus
        :sessions="data.sessions"
        :courseRegStatus="[data.courseRegistration]"
        @update-course-reg="(updates) => (data.courseRegistration = [updates])"
        :currentSession="data.currentSession"
        :currentSemester="data.currentSemester"
        class="mt-6"
      />
    </VCard>
  </main>
</template>
