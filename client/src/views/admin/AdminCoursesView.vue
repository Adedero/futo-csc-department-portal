<script setup>
import { ref } from 'vue'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const { data: courses } = await useGet('/api/admin/courses', { router, toast })

const isEditing = ref(false)
const editedCourse = ref({})

const editCourse = (data) => {
  isEditing.value = true
  editedCourse.value = { ...data }
}

const cancelEdit = () => {
  isEditing.value = false
  editedCourse.value = {}
}

const saveEdit = (data) => {
  const index = courses.value.findIndex((course) => course._id.toString() === data._id.toString())
  if (index !== -1) {
    courses.value[index] = data
  }
}

const deleteCourse = async (data) => {
  data.loading = true
  await usePost(`/api/admin/delete-course/${data._id}`, { method: 'DELETE', router, toast }, () => {
    courses.value = courses.value.filter((course) => course._id.toString() !== data._id.toString())
  })
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  code: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
})

const confirmDelete = (data) => {
  confirm.require({
    message: 'Do you want to delete this course?',
    header: `Delete ${data.code}`,
    icon: 'pi pi-info-circle',
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      deleteCourse(data)
    }
  })
}
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <ConfirmDialog></ConfirmDialog>
    <VCard>
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-bold text-xl">Courses: {{ courses.length }}</h1>

        <div class="flex items-center gap-2">
          <NewCourseForm
            @hide="cancelEdit"
            :isEditing
            :edited-course="editedCourse"
            @add-course="(course) => courses.unshift(course)"
            @edit-course="saveEdit"
          >
            <template #addButton="{ open }">
              <Button @click="open" label="Add" icon="pi pi-user-plus" />
            </template>
          </NewCourseForm>
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

    <VCard class="mt-2 h-[calc(100dvh-13.5rem)] max-w-full overflow-x-auto">
      <DataTable
        v-model:filters="filters"
        :sortOrder="1"
        :value="courses"
        dataKey="_id"
        scrollable
        tableStyle="min-width: 0"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
      >
        <Column field="code" header="Code" sortable style="width: 25%"></Column>
        <Column field="title" header="Title" sortable style="width: 25%"></Column>
        <Column field="unit" header="Units" style="width: 25%"></Column>
        <Column field="semester" header="Semester" style="width: 25%"></Column>
        <Column field="level" header="Level" sortable style="width: 25%"></Column>
        <Column style="min-width: 12rem">
          <template #body="slotProps">
            <div class="flex items-center gap-3">
              <Button
                icon="pi pi-pencil"
                outlined
                rounded
                class="mr-2"
                @click="editCourse(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                outlined
                rounded
                severity="danger"
                :loading="slotProps.data.loading"
                @click="confirmDelete(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <!-- <table class="table table-sm">
        <thead>
          <th>S/N</th>
          <th>Code</th>
          <th>Title</th>
          <th>Units</th>
          <th>Semester</th>
          <th>Level</th>
        </thead>

        <tbody>
          <tr v-for="course, index in courses" :key="course._id" @click="$router.push(`/admin/student/${course._id}`)"
            class="cursor-pointer">
            <td>{{ (page * limit) + index + 1 }}</td>
            <td>{{ course.code }}</td>
            <td>{{ course.title }}</td>
            <td>{{ course.Units }}</td>
            <td>{{ course.semester }}</td>
            <td>{{ course.level }}</td>
          </tr>
        </tbody>
      </table> -->
    </VCard>
  </main>
</template>
