<script setup>
import { ref } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'

const router = useRouter()
const toast = useToast()

const { data: staffs } = await useGet(`/api/hod/all-staffs`, { router, toast })

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const goToStaffProfile = (staff) => {
  router.push(`/hod/staff/${staff._id}`)
}
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <VCard>
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-bold text-xl">Staffs: {{ staffs.length }}</h1>

        <div class="flex items-center gap-2">
          <NewStaffForm model="hod" @add-staff="(staff) => staffs.unshift(staff)">
            <template #addButton="{ open }">
              <Button @click="open" label="Add" icon="pi pi-user-plus" />
            </template>
          </NewStaffForm>
        </div>
      </div>

      <div class="mt-2 flex items-center justify-between gap-2">
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
        :value="staffs"
        dataKey="_id"
        scrollable
        tableStyle="min-width: 0"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column style="min-width: 4rem">
          <template #body="{ data }">
            <VAvatar :image="data.user.image" rounded />
          </template>
        </Column>

        <Column field="user.name" header="Name" sortable style="width: 25%; min-width: 10rem">
          <template #body="{ data }">
            <p>{{ data.user.name }}</p>
            <small v-show="data.isAdvisor" class="text-red-500 font-medium block">Advisor</small>
          </template>
        </Column>

        <Column field="staffId" header="Staff ID" style="width: 25%; min-width: 6rem"> </Column>

        <Column field="rank" header="Rank" style="width: 25%"></Column>

        <Column field="qualification" header="Qualifications" style="width: 25%; min-width: 10rem">
          <template #body="{ data }">
            <ul class="list-disc">
              <li v-for="q in data.qualification" :key="q">{{ q }}</li>
            </ul>
          </template>
        </Column>

        <Column field="specialization" header="Specialization" style="width: 25%; min-width: 10rem">
          <template #body="{ data }">
            <ul class="list-disc">
              <li v-for="s in data.specialization" :key="s">{{ s }}</li>
            </ul>
          </template>
        </Column>

        <Column>
          <template #body="slotProps">
            <Button
              @click="goToStaffProfile(slotProps.data)"
              label="Profile"
              size="small"
              icon="pi pi-user"
              outlined
              rounded
            />
          </template>
        </Column>
      </DataTable>
    </VCard>
  </main>
</template>
