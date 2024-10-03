<script setup>
import { computed, ref } from 'vue'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)

const { data: classes } = await useGet('/api/admin/classes', { router, toast })
const { data: staffs } = await useGet('/api/admin/all-staffs', { router, toast })

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

const saveEdit = async (edit, create) => {
  loading.value = true
  await usePost(`/api/admin/manage-class?create=${create}`, { body: edit, router, toast })
  const { data: newData } = await useGet('/api/admin/classes', { router, toast })
  classes.value = [...newData.value]
  loading.value = false
}

const validateFields = async (event, create) => {
  const editedClass = event.newData || event

  const { newAdvisor } = editedClass

  const isClassNameValid = validateClassName(editedClass.className)
  if (!isClassNameValid) return showToast('Invalid class name')
  if (editedClass.currentLevel > 1000) return showToast('Invalid class level')

  const existingClass = classes.value.find(
    (c) => c.className === editedClass.className || c.currentLevel === editedClass.currentLevel
  )

  if (existingClass && existingClass._id.toString() !== editedClass._id.toString())
    return showToast('A class with this name or this level already exists')

  const checker =
    create === 'no'
      ? newAdvisor &&
        newAdvisor.isAdvisor &&
        newAdvisor.studentClass.toString() !== editedClass._id.toString()
      : newAdvisor && newAdvisor.isAdvisor

  if (checker) return confirmClassEdit(editedClass, create)

  saveEdit(editedClass, create)
}

function confirmClassEdit(data, create) {
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
      saveEdit(data, create)
    }
  })
}

function validateClassName(className) {
  if (!className) return false
  const classNameArray = className.split('-')
  if (classNameArray.length !== 2) return false
  const start = parseInt(classNameArray[0])
  const end = parseInt(classNameArray[classNameArray.length - 1])

  if (end > start && end - start === 1) return true
  return false
}

function showToast(message) {
  toast.open({ type: 'warning', message: message, duration: 5000, position: 'top-right' })
}
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <ConfirmDialog class="max-w-96"></ConfirmDialog>
    <VCard>
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-bold text-xl">Classes: {{ classes.length }}</h1>

        <div class="flex items-center gap-2">
          <NewClassForm :staffs @add-class="(studentClass) => validateFields(studentClass, 'yes')">
            <template #addButton="{ open }">
              <Button @click="open" label="Add" icon="pi pi-user-plus" />
            </template>
          </NewClassForm>
        </div>
      </div>

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
      <div v-if="loading" class="w-full h-full grid place-content-center">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          strokeWidth="8"
          fill="transparent"
          animationDuration=".5s"
          aria-label="Custom ProgressSpinner"
        />
      </div>

      <DataTable
        v-else
        v-model:filters="filters"
        :value="filteredClasses"
        dataKey="_id"
        editMode="row"
        v-model:editingRows="editingRows"
        @row-edit-save="(event) => validateFields(event, 'no')"
        scrollable
        tableStyle="min-width: 0"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column field="className" header="Name" sortable style="width: 25%; min-width: 10rem">
          <template #editor="{ data, field }">
            <InputMask v-model="data[field]" mask="9999-9999" fluid />
          </template>
        </Column>

        <Column
          field="enrolmentYear"
          header="Year of Enrolment"
          sortable
          style="width: 25%; min-width: 6rem"
        >
          <template #editor="{ data, field }">
            <InputMask v-model="data[field]" mask="9999" fluid />
          </template>
        </Column>

        <Column field="currentLevel" header="Level" sortable style="width: 25%">
          <template #editor="{ data, field }">
            <InputNumber v-model="data[field]" fluid />
          </template>
        </Column>

        <Column
          field="advisor.user.name"
          header="Advisor"
          sortable
          style="width: 25%; min-width: 10rem"
        >
          <template #editor="{ data }">
            <Select v-model="data.newAdvisor" :options="staffs" optionLabel="user.name" fluid />
          </template>
        </Column>

        <Column field="isActive" header="Status" style="width: 25%">
          <template #body="{ data }">
            <p>{{ data.isActive ? 'ACTIVE' : 'GRADUATED' }}</p>
          </template>
          <template #editor="{ data, field }">
            <div class="flex items-center gap-1">
              <Checkbox v-model="data[field]" :binary="true" />
              <label class="text-sm font-semibold">{{
                data[field] ? 'Active' : 'Graduated'
              }}</label>
            </div>
          </template>
        </Column>

        <Column
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center"
        ></Column>

        <Column>
          <template #body="slotProps">
            <RouterLink :to="`/admin/student-class/${slotProps.data._id}`">
              <Button label="Students" size="small" icon="pi pi-users" outlined rounded />
            </RouterLink>
          </template>
        </Column>
      </DataTable>
    </VCard>
  </main>
</template>
