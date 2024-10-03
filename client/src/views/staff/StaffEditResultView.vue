<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data } = await useGet(
  `/api/staff/get-result-to-edit?resultId=${route.params.resultId}`,
  { router, toast },
  (payload) => {
    if (payload.approved) {
      toast.warning('The result has already been approved and cannot be edited. Redirecting...', {
        position: 'top-right',
        duration: 3000
      })
      setTimeout(() => {
        router.push(`/staff/view-result/${payload.resultId}`)
      }, 3000)
      return
    }
    payload.students.sort((a, b) => a.name.localeCompare(b.name))
  }
)
</script>

<template>
  <main v-if="data.students" class="w-full h-full overflow-y-auto p-2">
    <VCard>
      <div>
        <h1 class="text-lg font-bold">Editing {{ data.course.code }}</h1>
        <div class="flex items-center flex-wrap">
          <p>{{ data.course.title }}</p>
          <Divider layout="vertical" />
          <p>{{ data.course.unit }} Units</p>
        </div>
      </div>
    </VCard>

    <ResultEditor model="staff" :payload="data" class="mt-2" />
  </main>
</template>
