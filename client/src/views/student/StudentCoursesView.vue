<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const { data } = await useGet('/api/student/course-reg-details', { router, toast })
</script>

<template>
  <main class="w-full h-full overflow-y-auto p-2">
    <VCard>
      <div class="flex items-center gap-3 justify-between">
        <h1 class="text-lg font-bold">Courses</h1>
        <ConfirmCourseRegStatus
          :studentClass="data.studentClass"
          :courseRegStatus="data.courseRegStatus"
        />
      </div>
    </VCard>

    <VCard class="mt-2">
      <h1 class="font-semibold">Registered Courses</h1>
      <RegisteredCourses :history="data.history" />
    </VCard>

    <VCard class="mt-2">
      <h1 class="font-semibold">Semester Courses</h1>
      <SemesterCourses :semesterCourses="data.semesterCourses" />
    </VCard>
  </main>
</template>
