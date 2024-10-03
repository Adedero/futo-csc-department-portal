<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const { data: results } = await useGet('/api/dean/pending-results', { router, toast })

const approveResult = (approvedResult) => {
  results.value = results.value.filter(result => result._id.toString() !== approvedResult._id.toString())
  /* const approvedResultIndex = results.value.findIndex(
    (result) => result._id.toString() === approvedResult._id.toString()
  )
  results.value[approvedResultIndex] = approvedResult */
}

const disapproveResult = (disapprovedResult) => {
  const disapprovedResultIndex = results.value.findIndex(
    (result) => result._id.toString() === disapprovedResult._id.toString()
  )
  results.value[disapprovedResultIndex] = disapprovedResult
}
</script>

<template>
  <main class="w-full h-full p-2 overflow-y-auto">
    <VCard>
      <h1 class="font-bold text-lg">Results</h1>
    </VCard>

    <VCard class="mt-2">
      <DeanPendingResults
        :results
        @approve-result="approveResult"
        @disapprove-result="disapproveResult"
      />
    </VCard>
  </main>
</template>
