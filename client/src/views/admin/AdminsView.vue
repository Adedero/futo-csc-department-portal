<script setup>
import { ref } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfirm } from 'primevue/useconfirm'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const userStore = useUserStore()

const { data: admins } = await useGet(`/api/admin/get-admins`, { router, toast })

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const deletAdmin = async () => {
  //Delete login
}

const confirmDelete = (admin) => {
  confirm.require({
    message: `Delete admin account? This cannot be undone.`,
    header: `Delete Admin`,
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Proceed',
      severity: 'danger'
    },
    accept: () => {
      deletAdmin(admin)
    }
  })
}
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <ConfirmDialog></ConfirmDialog>
    <VCard>
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-bold text-xl">Admins: {{ admins.length }}</h1>

        <div class="flex items-center gap-2">
          <NewAdminForm @add-admin="(admin) => admins.unshift(admin)">
            <template #addButton="{ open }">
              <Button @click="open" label="Add" icon="pi pi-user-plus" />
            </template>
          </NewAdminForm>
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
        :value="admins"
        dataKey="_id"
        scrollable
        tableStyle="min-width: 0"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 30]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column style="min-width: 4rem">
          <template #body="{ data }">
            <VAvatar :image="data.image" rounded class="w-12" />
          </template>
        </Column>

        <Column field="name" header="Name" sortable style="width: 25%; min-width: 10rem">
          <template #body="{ data }">
            {{ data.name }}
            <sup v-if="data._id === userStore.user.id" class="text-red-500 font-semibold">You</sup>
          </template>
        </Column>

        <Column field="username" header="Username" sortable style="width: 25%; min-width: 6rem">
        </Column>

        <Column field="email" header="Email" sortable style="width: 25%; min-width: 6rem"> </Column>

        <Column style="min-width: 4rem">
          <template #body="slotProps">
            <Button
              v-if="slotProps.data._id !== userStore.user.id"
              @click="confirmDelete(slotProps.data)"
              label="Delete"
              severity="danger"
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
