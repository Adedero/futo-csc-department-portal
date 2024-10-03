<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const { data } = await useGet('/api/advisor/uploaded-results', { router, toast })

const viewDetails = (result) => {
  router.push({
    name: 'advisor-ogr-result',
    params: { resultId: result._id }
  })
}
</script>

<template>
  <main class="h-full overflow-y-auto w-full p-2">
    <VCard>
      <div class="flex items-center gap-2 justify-between">
        <h1 class="font-bold text-xl">Results</h1>
        <UploadResultForm model="advisor" :staff="data.staff" :sessions="data.sessions">
          <template #addButton="{ open }">
            <Button @click="open" label="Add Result" icon="pi pi-file-plus" />
          </template>
        </UploadResultForm>
      </div>
    </VCard>

    <VCard class="mt-2">
      <div class="w-full overflow-auto max-h-[calc(100dvh-13rem)]">
        <DataTable
          :value="data.results"
          size="small"
          dataKey="_id"
          scrollable
          tableStyle="min-width: 0"
        >
          <Column field="course.code" header="Code"></Column>

          <Column field="session" header="Session"></Column>

          <Column field="semester" header="Semester"></Column>

          <Column header="Approval">
            <template #body="{ data }">
              <p
                :class="[
                  data.isHODApproved || data.isDeanApproved ? 'text-green-500' : 'text-red-500',
                  'font-medium'
                ]"
              >
                {{ data.isHODApproved || data.isDeanApproved ? 'Approved' : 'Pending' }}
              </p>
            </template>
          </Column>

          <Column>
            <template #body="slotProps">
              <Button
                @click="viewDetails(slotProps.data)"
                label="View"
                size="small"
                icon="pi pi-book"
                outlined
                rounded
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </VCard>
  </main>
</template>
