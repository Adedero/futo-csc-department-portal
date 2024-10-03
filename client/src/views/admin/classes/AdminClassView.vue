<script setup>
import { ref } from 'vue'
import { useGet, useFormGet, useFormPost } from '@/composables/server/use-fetch'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'
const route = useRoute()
const router = useRouter()
const toast = useToast()

const menu = ref(null)

const { data: classData } = await useGet(`/api/admin/class-students/${route.params.id}`, {
  router,
  toast
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const visible = ref(false)
const items = ref([
  {
    label: 'Class List',
    items: [
      {
        label: 'Import',
        icon: 'pi pi-file-import',
        command: () => (visible.value = true)
      },
      {
        label: 'Export',
        icon: 'pi pi-file-export',
        command: () => downloadClassList()
      }
    ]
  }
])

const duplicates = ref({ error: false, students: [] })
const loading = ref(false)
const onUpload = async (files) => {
  duplicates.value = { error: false, students: [] }

  const classList = files[0]
  const formData = new FormData()

  formData.append('classList', classList)
  formData.append('classId', classData.value.studentClass._id)

  loading.value = true
  await useFormPost(
    '/api/admin/upload-class-list',
    { router, toast, body: formData, toastOnSuccess: true, successDetail: 'Done', toastLife: 3000 },
    (data) => {
      visible.value = false
      const { duplicateStudents, addedStudents } = data
      classData.value.students.push(...addedStudents)
      if (duplicateStudents.length) {
        duplicates.value = {
          error: true,
          students: [...duplicateStudents]
        }
      }
    }
  )
  loading.value = false
}

const isDownloading = ref(false)
const errorDownloading = ref(false)
async function downloadClassList() {
  isDownloading.value = true
  const { payload, error } = await useFormGet(
    `/api/admin/download-class-list?classId=${classData.value.studentClass._id}`,
    { router, toast }
  )
  isDownloading.value = false
  errorDownloading.value = error
  const data = await payload.value.arrayBuffer()
  console.log(data)
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `CLASS_LIST_${route.params.id}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <Drawer v-model:visible="duplicates.error" header="Duplicate Records" class="max-w-96">
      <p class="text-sm text-red-500 font-semibold mb-3">
        The following students could not be added because their records may already exist. Please
        check and try again.
      </p>
      <div v-if="duplicates.students.length" class="flex flex-col gap-2">
        <div
          v-for="student in duplicates.students"
          :key="student.regNumber"
          class="flex-shrink-0 p-2 border-b"
        >
          <p class="font-semibold">{{ student.name }}</p>
          <p class="text-sm text-slate-600">{{ student.regNumber }}</p>
        </div>
      </div>
    </Drawer>

    <Dialog v-model:visible="isDownloading" header="Downloading Class List" class="max-w-96" modal>
      <div class="flex flex-col items-center justify-center gap-3 w-80">
        <ProgressBar
          v-if="!errorDownloading"
          mode="indeterminate"
          style="height: 10px; width: 100%"
        ></ProgressBar>
        <p class="text-center text-slate-600" :class="{ 'text-red-500': errorDownloading }">
          {{ errorDownloading ? 'Failed. Please try again.' : 'Please hold on...' }}
        </p>
        <Button
          v-if="errorDownloading"
          label="Retry"
          severity="secondary"
          @click="downloadClassList"
        />
      </div>
    </Dialog>

    <Dialog v-model:visible="visible" header="Import Class List" class="max-w-96">
      <small class="text-red-500">Please read the guidelines before uploading!</small>
      <VTab header="Guidelines">
        <ul class="list-disc text-sm ml-5 grid gap-2">
          <li>Only MS Excel files (.xls and .xlsx) are allowed.</li>
          <li>Excel file must not be more that 2MB.</li>
          <li>Excel file should have only two fields: 'Name' and 'Reg. Number' as shown below.</li>
          <li>Use only the columns A and B as shown below.</li>
          <li>
            The list must be the first sheet in the Excel file. If you file has multiple sheets,
            only the first one will be processed.
          </li>
          <li>Finally, Do not rename the sheet. It must appear as "Sheet1"</li>
        </ul>
        <div class="mt-2">
          <p class="text-sm font-semibold">Sample:</p>
          <img src="../../../assets/img/sample-excel.png" alt="sample excel file" />
        </div>
      </VTab>

      <div class="w-full mt-2">
        <FileUploader
          v-if="visible"
          @upload="onUpload"
          :loading
          accept=".xls,.xlsx"
          :maxFileSize="1024 * 1024 * 2"
          invalidFileSizeMessage="File size should 2MB or less."
          invalidFileTypeMessage="Invalid file type. Only Excel files (.xls and .xlsx) are allowed."
        />
      </div>
    </Dialog>
    <VCard>
      <div class="flex items-center justify-between gap-2">
        <div>
          <h1 class="font-bold">Class {{ classData.studentClass.className }}</h1>
          <h1 class="font-bold text-xl">Students: {{ classData.students.length }}</h1>
        </div>

        <div class="flex items-center gap-2">
          <NewStudentForm
            :studentClass="classData.studentClass.className"
            @add-student="(student) => classData.students.unshift(student)"
          >
            <template #addButton="{ open }">
              <Button @click="open" label="Add" icon="pi pi-user-plus" />
            </template>
          </NewStudentForm>

          <Button
            @click="($event) => menu.toggle($event)"
            severity="secondary"
            icon="pi pi-ellipsis-v"
          />
          <Menu ref="menu" :model="items" popup />
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

    <VCard class="mt-2 h-[calc(100dvh-14rem)] max-w-full overflow-x-auto">
      <DataTable
        v-model:filters="filters"
        sortField="user.name"
        :sortOrder="1"
        :value="classData.students"
        dataKey="_id"
        scrollable
        tableStyle="min-width: 0"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column field="user.name" header="Name" :sortable="true" style="width: 25%"></Column>
        <Column field="regNumber" header="Reg. Number" style="width: 25%"></Column>
        <Column field="entryMode" header="Entry Mode" style="width: 25%"></Column>
        <Column field="user.sex" header="Sex"></Column>
        <Column>
          <template #body="slotProps">
            <RouterLink :to="`/admin/student/${slotProps.data._id}`">
              <Button label="Profile" size="small" icon="pi pi-user" outlined rounded />
            </RouterLink>
          </template>
        </Column>
      </DataTable>
    </VCard>
  </main>
</template>
