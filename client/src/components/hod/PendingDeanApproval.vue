<script setup>
import { ref } from 'vue'
import { useDate } from '@/composables/utils/format'
import { FilterMatchMode } from '@primevue/core/api'
import { usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

defineProps({
  results: { type: Array, required: true }
})

const emit = defineEmits(['disapprove-result'])

const router = useRouter()
const toast = useToast()

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const reason = ref('')
const disApproveResult = async (result) => {
  if (!disApproveResult) return
  result.isDisapproving = true
  await usePost(
    `/api/hod/disapprove-result/${result._id}`,
    {
      method: 'PUT',
      body: { reason: reason.value },
      router,
      toast,
      toastOnSuccess: true,
      toastLife: 200
    },
    () => {
      result.isHODApproved = false
      result.HODDisapproved = {
        isDisapproved: true,
        reason: reason.value
      }
      emit('disapprove-result', result)
    }
  )
  reason.value = ''
  result.isDisapproving = false
  result.visible = false
}
</script>

<template>
  <div class="w-full overflow-auto">
    <div class="mt-2 flex items-center justify-end">
      <IconField class="w-full">
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText v-model="filters['global'].value" placeholder="Search..." class="w-full" />
      </IconField>
    </div>

    <DataTable
      v-model:filters="filters"
      :value="results"
      dataKey="_id"
      scrollable
      tableStyle="min-width: 0"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
    >
      <Column>
        <template #body="{ data }">
          <Button
            v-if="data.deanDisapproved.isDisapproved"
            @click="data.isVisible = true"
            icon="pi pi-times-circle"
            rounded
            severity="danger"
            text
          />
          <Button v-else icon="pi pi-question-circle" rounded text />
          <Dialog v-model:visible="data.isVisible" header="Result Disapproved" class="w-80" modal>
            <div>
              <p class="text-sm font-semibold">Reason:</p>
              <p class="whitespace-pre-wrap border rounded-lg p-2 mt-2 text-red-500 border-red-500">
                {{ data.deanDisapproved.reason || 'No reason' }}
              </p>
            </div>
          </Dialog>
        </template>
      </Column>

      <Column field="course" header="Course" sortable></Column>

      <Column field="staff" header="Staff" sortable class="min-w-56"></Column>

      <Column field="semester" header="Semester"></Column>

      <Column field="level" header="Level" sortable></Column>

      <Column field="updatedAt" header="Date" sortable>
        <template #body="{ data }">
          {{ useDate(data.updatedAt) }}
        </template>
      </Column>

      <Column>
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <Button
              label="View"
              icon="pi pi-eye"
              text
              @click="$router.push(`/hod/view-result/${slotProps.data._id}`)"
            />
          </div>
        </template>
      </Column>

      <Column>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <Button icon="pi pi-times" severity="danger" outlined @click="data.visible = true" />
          </div>
          <Dialog v-model:visible="data.visible" header="Disapprove Result" class="w-96" modal>
            <div class="grid gap-3">
              <div class="grid gap-1">
                <p class="text-sm font-semibold">
                  State Reason <small class="text-[--p-primary-color]">optional</small>
                </p>
                <Textarea v-model="reason" auto-resize rows="3" fluid />
              </div>

              <div class="flex justify-end">
                <Button
                  :label="reason ? 'Disapprove' : 'Skip'"
                  :severity="reason ? 'danger' : 'secondary'"
                  @click="disApproveResult(data)"
                  :loading="data.isDisapproving"
                />
              </div>
            </div>
          </Dialog>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
