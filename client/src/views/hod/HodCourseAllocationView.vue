<script setup>
import { computed, ref } from 'vue'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const { data } = await useGet(`/api/hod/course-allocation`, { router, toast })

const staffs = computed(() => {
  return data.value.staffs.map((staff) => {
    return {
      id: staff._id,
      name: staff.user.name
    }
  })
})

const newStaffs = ref([])

const courses = ref(getAllocations(data.value.staffs))

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

const editingRows = ref([])

const loading = ref(false)
const saveEdit = async (event) => {
  const course = {
    _id: event.newData._id,
    code: event.newData.code,
    level: event.newData.level,
    title: event.newData.title,
    staffs: newStaffs.value
  }
  loading.value = true
  await usePost(
    `/api/hod/allocate-course`,
    {
      method: 'PUT',
      body: course,
      router,
      toast,
      toastOnSuccess: true,
      toastLife: 3000
    },
    () => {
      const index = courses.value.findIndex((c) => c._id.toString() === course._id.toString())
      if (index !== -1) {
        courses.value[index] = course
      }
    }
  )
  loading.value = false
}

const checkEmptyStaffs = (event) => {
  if (!newStaffs.value.length) {
    return confirm.require({
      message: `Remove all lecturers assigned to this course?`,
      header: `Course Allocation`,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: 'Proceed'
      },
      accept: () => {
        saveEdit(event)
      }
    })
  }
  saveEdit(event)
}

//Adding new course allocation record
const newRecord = ref({
  course: null,
  staffs: []
})

const visible = ref(false)

const newLoading = ref(false)
const addNewCourseAllocation = async () => {
  const course = {
    _id: newRecord.value.course._id,
    code: newRecord.value.course.code,
    level: newRecord.value.course.level,
    title: newRecord.value.course.title,
    staffs: newRecord.value.staffs
  }

  newLoading.value = true

  await usePost(
    `/api/hod/allocate-course`,
    {
      method: 'PUT',
      body: course,
      router,
      toast,
      toastOnSuccess: true,
      toastLife: 3000
    },
    () => {
      courses.value.unshift(course)
      newRecord.value = { course: null, staffs: [] }
      visible.value = false
    }
  )
  newLoading.value = false
}

function getAllocations(staffs) {
  const courseMap = new Map()
  staffs
    .filter((staff) => staff.courses && staff.courses.length)
    .forEach((staff) => {
      staff.courses.forEach((course) => {
        if (courseMap.has(course.code)) {
          // If the course already exists, add the staff to its staff list
          courseMap.get(course.code).staffs.push({
            id: staff._id,
            name: staff.user.name
          })
        } else {
          // If the course doesn't exist, create a new course object
          courseMap.set(course.code, {
            _id: course._id,
            code: course.code,
            title: course.title,
            level: course.level,
            staffs: [{ id: staff._id, name: staff.user.name }]
          })
        }
      })
    })
  // Convert the map back to an array
  const courseList = Array.from(courseMap.values())
  // Sort courses by level
  courseList.sort((a, b) => a.level - b.level)

  return courseList
}

function printAllocation() {
  window.print()
}
</script>

<template>
  <main class="p-2 w-full h-full overflow-y-auto">
    <ConfirmDialog></ConfirmDialog>
    <VCard>
      <div class="flex items-center gap-2 justify-between">
        <div class="details">
          <h1 class="text-lg font-bold">Course Allocation</h1>
          <div class="flex flex-wrap items-center gap-3">
            <p>
              Session: <span class="font-semibold">{{ data.currentSession.name }}</span>
            </p>
            <p>
              Semester: <span class="font-semibold">{{ data.currentSemester.name }}</span>
            </p>
          </div>
        </div>
        <Button @click="printAllocation" label="Print" severity="secondary" class="print-btn" />
      </div>

      <div class="no-display mt-2 flex items-center justify-between gap-2">
        <Button @click="visible = true" label="Add" icon="pi pi-plus" />
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Search..." class="w-full" />
        </IconField>
        <Dialog v-model:visible="visible" header="Allocate Course" class="w-80">
          <div class="grid gap-3 w-full">
            <div>
              <p class="text-sm font-medium">Course</p>
              <Select
                v-model="newRecord.course"
                :options="data.courses"
                option-label="code"
                filter
                fluid
              />
            </div>
            <div>
              <p class="text-sm font-medium">Staffs</p>
              <MultiSelect
                v-model="newRecord.staffs"
                :options="staffs"
                option-label="name"
                display="chip"
                filter
                fluid
                class="w-[17.4rem]"
              />
            </div>
            <Button
              @click="addNewCourseAllocation"
              label="Add"
              icon="pi pi-plus"
              :loading="newLoading"
              :disabled="newLoading || !newRecord.course || !newRecord.staffs.length"
            />
          </div>
        </Dialog>
      </div>

      <div class="allocation">
        <DataTable
          :loading
          v-model:filters="filters"
          :value="courses"
          dataKey="_id"
          editMode="row"
          v-model:editingRows="editingRows"
          @row-edit-save="checkEmptyStaffs"
          scrollable
          tableStyle="min-width: 0"
        >
          <Column field="level" header="Level" sortable></Column>

          <Column field="code" header="Code" sortable style="min-width: 8rem"></Column>

          <Column field="title" header="Title"></Column>

          <Column field="staff" header="Staff">
            <template #body="slotProps">
              <ol class="list-disc">
                <li v-for="staff in slotProps.data.staffs" :key="staff.id">{{ staff.name }}</li>
              </ol>
            </template>

            <template #editor>
              <ul class="text-sm list-disc">
                <li v-for="staff in newStaffs" :key="staff.id">{{ staff.name }}</li>
              </ul>

              <MultiSelect
                v-model="newStaffs"
                display="chip"
                :options="staffs"
                optionLabel="name"
                filter
                fluid
                class="w-60"
              />
            </template>
          </Column>

          <Column
            :rowEditor="true"
            style="width: 10%; min-width: 8rem"
            bodyStyle="text-align:center"
            class="no-display"
          ></Column>
        </DataTable>
      </div>
    </VCard>
  </main>
</template>

<style>
@media print {
  body {
    visibility: hidden;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .details {
    visibility: visible;
    border-radius: 0;
    border: 0;
    box-shadow: none;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
  }

  .allocation {
    overflow: visible;
    display: grid;
    break-inside: avoid;
    visibility: visible;
    border-radius: 0;
    border: 0;
    box-shadow: none;
    padding: 0;
    position: absolute;
    top: 5rem;
    left: 0;
    width: 210mm;
    height: 297mm;
  }

  title,
  .print-btn,
  .no-display {
    display: none;
  }
}
</style>
