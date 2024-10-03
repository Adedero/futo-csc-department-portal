<script setup>
import { computed, ref } from 'vue'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)

const { data: classes } = await useGet('/api/hod/classes', { router, toast })
const { data: staffs } = await useGet('/api/hod/all-staffs', { router, toast })

const options = ref(['All', 'Active', 'Graduated'])

const classFilter = ref(options.value[0])

const filteredClasses = computed(() => {
  if (classFilter.value === options.value[0]) {
    return classes.value
  }

  if (classFilter.value === options.value[1]) {
    return classes.value.filter((studentClass) => studentClass.isActive)
  }

  if (classFilter.value === options.value[2]) {
    return classes.value.filter((studentClass) => !studentClass.isActive)
  }
  return classes.value
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const editingRows = ref([])

const saveEdit = async (edit) => {
  loading.value = true
  await usePost(`/api/hod/manage-class`, { body: edit, router, toast })
  const { data: newData } = await useGet('/api/hod/classes', { router, toast })
  classes.value = [...newData.value]
  loading.value = false
}

const validateFields = async (event) => {
  const editedClass = event.newData || event
  const { newAdvisor } = editedClass

  const checker =
    newAdvisor &&
    newAdvisor.isAdvisor &&
    newAdvisor.studentClass.toString() !== editedClass._id.toString()
  if (checker) return confirmClassEdit(editedClass)
  saveEdit(editedClass)
}

function confirmClassEdit(data) {
  confirm.require({
    message: `${data.newAdvisor.user.name} is already and advisor. This action would remove them from their current class. Proceed?`,
    header: `Overwrite advisor`,
    icon: 'pi pi-info-circle',
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
      saveEdit(data)
    }
  })
}
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <ConfirmDialog class="max-w-96"></ConfirmDialog>
    <VCard>
      <h1 class="font-bold text-xl">Classes: {{ classes.length }}</h1>

      <div class="mt-2 flex items-center justify-between gap-2">
        <IconField class="w-full">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Search..." class="w-full" />
        </IconField>

        <Select v-model="classFilter" :options="options" />
      </div>
    </VCard>

    <VCard class="mt-2 h-[calc(100dvh-13.5rem)] max-w-full overflow-x-auto">
      <DataTable
        :loading
        v-model:filters="filters"
        :value="filteredClasses"
        dataKey="_id"
        editMode="row"
        v-model:editingRows="editingRows"
        @row-edit-save="(event) => validateFields(event)"
        scrollable
        tableStyle="min-width: 0"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column
          field="className"
          header="Name"
          sortable
          style="width: 25%; min-width: 10rem"
        ></Column>

        <Column
          field="enrolmentYear"
          header="Year of Enrolment"
          sortable
          style="width: 25%; min-width: 6rem"
        ></Column>

        <Column field="currentLevel" header="Level" sortable style="width: 25%"></Column>

        <Column
          field="advisor.user.name"
          header="Advisor"
          sortable
          style="width: 25%; min-width: 10rem"
        >
          <template #editor="{ data }">
            <small class="font-semibold">Change Advisor</small>
            <Select v-model="data.newAdvisor" :options="staffs" optionLabel="user.name" fluid />
          </template>
        </Column>

        <Column field="isActive" header="Status" style="width: 25%">
          <template #body="{ data }">
            <p>{{ data.isActive ? 'ACTIVE' : 'GRADUATED' }}</p>
          </template>
        </Column>

        <Column
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center"
        ></Column>
      </DataTable>
    </VCard>
  </main>
</template>
