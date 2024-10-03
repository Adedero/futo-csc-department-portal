<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useGet } from '@/composables/server/use-fetch'
import { FilterMatchMode } from '@primevue/core/api'

const router = useRouter()
const toast = useToast()

const visible = ref(false)
const type = ref('view')

const { data } = await useGet('/api/advisor/class-students', { router, toast })

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const addResult = () => {
  type.value = 'add'
  visible.value = true
}

const viewResult = () => {
  type.value = 'view'
  visible.value = true
}
</script>

<template>
  <main class="w-full h-full overflow-y-auto p-2">
    <div v-if="data.advisor && data.students" class="w-full h-full">
      <Dialog v-model:visible="visible" :header="type === 'view' ? 'View Result' : 'Add Result'">
        <AddViewClassResult
          :staffId="data.advisor._id"
          :sessions="data.sessions"
          :courses="data.courses"
          model="advisor"
          :type
        />
      </Dialog>
      <VCard>
        <div class="flex items-center gap-2 justify-between">
          <div>
            <h1 class="text-lg font-bold">Class {{ data.advisor.studentClass.className }}</h1>
            <p>{{ data.advisor.studentClass.currentLevel }} LEVEL</p>
          </div>

          <div class="flex items-center gap-2">
            <Button @click="addResult" label="Add Result" />
            <Button @click="viewResult" label="View Result" outlined />
          </div>
        </div>
      </VCard>

      <VCard class="mt-2">
        <div class="grid justify-end">
          <IconField class="w-full">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Search..." class="w-full" />
          </IconField>
        </div>

        <div class="h-[calc(100dvh-16rem)] max-w-full overflow-auto">
          <DataTable
            v-model:filters="filters"
            sortField="user.name"
            :sortOrder="1"
            :value="data.students"
            dataKey="_id"
            scrollable
            tableStyle="min-width: 0"
            paginator
            :rows="10"
            :rowsPerPageOptions="[10, 20, 50]"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          >
            <Column field="user.name" header="Name" :sortable="true"></Column>
            <Column field="regNumber" header="Reg. Number"></Column>
            <Column field="entryMode" header="Entry Mode"></Column>
            <Column field="user.sex" header="Sex"></Column>
            <Column>
              <template #body="slotProps">
                <RouterLink :to="`/advisor/student/${slotProps.data._id}`">
                  <Button label="Profile" size="small" icon="pi pi-user" outlined rounded />
                </RouterLink>
              </template>
            </Column>
          </DataTable>
        </div>
      </VCard>
    </div>

    <VCard v-else class="h-full w-full grid place-content-center">
      <Message severity="danger">
        {{ data.message }}
      </Message>
    </VCard>
  </main>
</template>
