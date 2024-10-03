<script setup>
import { computed } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const { data: results } = await useGet('/api/hod/pending-results', { router, toast })

const HODPendingResults = computed(() => {
  return results.value.filter((result) => !result.isHODApproved && !result.isDeanApproved)
})

const DeanPendingResults = computed(() => {
  return results.value.filter((result) => result.isHODApproved && !result.isDeanApproved)
})

const approveResult = (approvedResult) => {
  const approvedResultIndex = results.value.findIndex(
    (result) => result._id.toString() === approvedResult._id.toString()
  )
  results.value[approvedResultIndex] = approvedResult
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
      <Tabs value="0" scrollable>
        <TabList>
          <Tab value="0">Awaiting Your Approval: {{ HODPendingResults.length }}</Tab>
          <Tab value="1">Awaiting Dean Approval: {{ DeanPendingResults.length }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <PendingHODApproval :results="HODPendingResults" @approve-result="approveResult"
              @disapprove-result="disapproveResult" />
          </TabPanel>

          <TabPanel value="1">
            <PendingDeanApproval :results="DeanPendingResults" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VCard>
  </main>
</template>
