<script setup>
import { ref } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'

const router = useRouter()
const toast = useToast()

const { data: advisors } = await useGet('/api/admin/advisors', { router, toast })

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <VCard>
      <h1 class="font-bold text-xl">Advisors: {{ advisors.length }}</h1>

      <div class="mt-2">
        <IconField class="w-full">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Search..." class="w-full" />
        </IconField>
      </div>
    </VCard>

    <VCard class="mt-2 h-[calc(100dvh-13.5rem)] overflow-auto">
      <DataTable
        v-model:filters="filters"
        :value="advisors"
        dataKey="_id"
        scrollable
        tableStyle="min-width: 0"
      >
        <Column style="min-width: 4rem">
          <template #body="{ data }">
            <VAvatar :image="data.user.image" rounded />
          </template>
        </Column>

        <Column
          field="user.name"
          header="Name"
          sortable
          style="width: 25%; min-width: 10rem"
        ></Column>

        <Column field="staffId" header="Staff ID" style="width: 25%; min-width: 6rem"> </Column>

        <Column field="rank" header="Rank" style="width: 25%"></Column>

        <Column
          field="studentClass.className"
          header="Class"
          style="width: 25%; min-width: 10rem"
        ></Column>

        <Column
          field="studentClass.currentLevel"
          header="Level"
          style="width: 25%; min-width: 10rem"
        ></Column>

        <Column>
          <template #body="slotProps">
            <RouterLink :to="`/admin/staff/${slotProps.data._id}`">
              <Button label="Profile" size="small" icon="pi pi-user" outlined rounded />
            </RouterLink>
          </template>
        </Column>
      </DataTable>
    </VCard>
  </main>
</template>
