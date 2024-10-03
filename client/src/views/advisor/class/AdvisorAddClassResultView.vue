<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data } = await useGet(
  `/api/advisor/get-registered-class-students?staffId=${route.params.staffId}&session=${route.params.session}&semester=${route.params.semester}&level=${route.params.level}&course=${route.params.course.split('-').join(' ')}`,
  { router, toast },
  (payload) => {
    if (payload.existing) {
      router.push({
        name: 'advisor-edit-class-result',
        params: {
          resultId: payload.resultId
        }
      })
      return
    }
    if (!payload.records.length) {
      toast.info('No students have registered for this course.', {
        position: 'top-right',
        duration: 5000
      })
      return
    }
    payload.records.sort((a, b) => a.name.localeCompare(b.name))
  }
)
</script>

<template>
  <main v-if="data.records && data.records.length" class="w-full h-full overflow-y-auto p-2">
    <VCard>
      <div>
        <h1 class="text-lg font-bold">{{ data.course.code }}</h1>
        <div class="flex items-center flex-wrap">
          <p>{{ data.course.title }}</p>
          <Divider layout="vertical" />
          <p>{{ data.course.unit }} Units</p>
        </div>
      </div>
    </VCard>

    <ResultCreator
      model="advisor"
      :isAddedByAdvisor="true"
      :payload="{
        staffId: data.staffId,
        semester: data.semester,
        session: data.session,
        level: data.level
      }"
      :course="data.course"
      :records="data.records"
      class="mt-2"
    />
  </main>
</template>
