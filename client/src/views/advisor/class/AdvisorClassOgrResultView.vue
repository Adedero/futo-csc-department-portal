<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useGet } from '@/composables/server/use-fetch'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data } = await useGet(
  `/api/advisor/class-ogr-result?session=${route.params.session}&semester=${route.params.semester}&level=${route.params.level}&course=${route.params.course.split('-').join(' ')}`,
  { router, toast }
)

const print = () => window.print()

const editResult = () => {
  if (data.value.result.isAddedByAdvisor) {
    router.push(`/advisor/edit-class-result/${data.value.result._id}`)
    return
  }
  router.push(`/advisor/edit-result/${data.value.result._id}`)
}
</script>

<template>
  <main v-if="data.result && data.staff" class="w-full h-full overflow-y-auto p-2">
    <VCard>
      <div class="flex items-center gap-2 justify-between">
        <h1 class="text-lg font-bold">{{ data.result.course.code }} OGR</h1>

        <div class="flex gap-4">
          <Button
            @click="editResult"
            label="Edit"
            :disabled="
              data.result.isApprovedByHOD ||
              data.result.isApprovedByDean ||
              data.result.staff !== data.staff._id
            "
          />
          <Button severity="secondary" @click="print" label="Print" />
        </div>
      </div>
    </VCard>

    <VCard class="mt-2">
      <ResultOGR :payload="data" />
    </VCard>
  </main>

  <main v-else class="p-2 w-full h-full flex flex-col items-center justify-center">
    <Message>
      {{ data.message }}
    </Message>
  </main>
</template>
