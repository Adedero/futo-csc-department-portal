<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const router = useRouter()
const route = useRoute()

const { data } = await useGet(`/api/student/get-course-reg-details?id=${route.params.id}`, {
  router,
  toast
})
</script>

<template>
  <main class="w-full h-full p-2 overflow-y-auto">
    <CourseRegDetails :record="data" />
  </main>
</template>
