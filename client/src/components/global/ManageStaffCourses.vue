<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useConfirm } from 'primevue/useconfirm'

const props = defineProps({
  staff: { type: Object, required: true },
  user: { type: String, required: true }
})

const emit = defineEmits(['add-courses', 'remove-course', 'remove-all-courses'])

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const showCourseTitles = ref(true)
const visible = ref(false)
const loadingCourses = ref(false)

const courses = ref([])
const selectedCourses = ref([])

const getCourses = async () => {
  visible.value = true
  if (loadingCourses.value) return
  loadingCourses.value = true
  await useGet(`/api/${props.user}/courses?fields=code,title`, { router, toast }, (data) => {
    courses.value = data
  })
  loadingCourses.value = false
}

const addCoursesLoading = ref(false)
const addCourses = async () => {
  if (addCoursesLoading.value) return
  if (!selectedCourses.value.length) {
    return
  }

  const staffCoursesIds = props.staff.courses.map((course) => course._id.toString())

  const filteredCourses = selectedCourses.value.filter((course) => {
    return !staffCoursesIds.includes(course._id.toString())
  })
  if (!filteredCourses.length) {
    selectedCourses.value = []
    visible.value = false
    return
  }

  addCoursesLoading.value = true
  await usePost(
    `/api/${props.user}/add-staff-courses/${props.staff._id}`,
    {
      method: 'PUT',
      body: filteredCourses,
      router,
      toast,
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    () => {
      emit('add-courses', selectedCourses.value)
      selectedCourses.value = []
      visible.value = false
    }
  )
  addCoursesLoading.value = false
}

const removeSingleCourseLoading = ref(false)
const removeCourse = async (course) => {
  const courses = [course]
  removeSingleCourseLoading.value = true
  await usePost(
    `/api/${props.user}/remove-staff-courses/${props.staff._id}`,
    {
      method: 'PUT',
      body: { courses },
      router,
      toast,
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    () => emit('remove-course', course._id)
  )
  removeSingleCourseLoading.value = false
}

const confirmRemoveCourse = (event, data) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Are you sure you want to proceed?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Remove',
      severity: 'danger'
    },
    accept: () => {
      removeCourse(data)
    }
  })
}

const removeCoursesLoading = ref(false)

const removeAllCourses = async () => {
  if (!props.staff.courses.length) return
  removeCoursesLoading.value = true

  await usePost(
    `/api/${props.user}/remove-staff-courses/${props.staff._id}`,
    {
      method: 'PUT',
      body: { courses: [] },
      router,
      toast,
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    () => emit('remove-all-courses')
  )
  removeCoursesLoading.value = false
}
const confirmRemoveAllCourses = (event) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Remove all courses assigned to this staff?',
    icon: 'pi pi-exclamation-triangle',
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
      removeAllCourses()
    }
  })
}
</script>

<template>
  <VCard>
    <ConfirmPopup></ConfirmPopup>
    <Dialog v-model:visible="visible" modal header="Add Course" :style="{ width: '24rem' }">
      <div class="w-full">
        <p>Courses</p>
        <InputGroup>
          <MultiSelect
            v-model="selectedCourses"
            :options="courses"
            option-label="code"
            filter
            display="chip"
            :placeholder="loadingCourses ? 'Getting courses' : 'Select courses'"
          />
          <Button @click="addCourses" icon="pi pi-plus" :loading="addCoursesLoading" />
        </InputGroup>
        <div class="text-sm grid gap-1 mt-2">
          <p class="font-medium">Selected courses</p>
          <div class="flex flex-wrap items-center gap-2">
            <p v-for="course in selectedCourses" :key="course.code">{{ course.code }} |</p>
          </div>
        </div>
      </div>
    </Dialog>
    <div class="flex items-center gap-3">
      <span class="pi pi-book"></span>
      <h1 class="font-semibold">Courses</h1>
      <div class="flex ml-auto gap-2 items-center">
        <Button @click="getCourses" icon="pi pi-plus" rounded />
        <Button
          @click="confirmRemoveAllCourses($event)"
          icon="pi pi-trash"
          severity="danger"
          outlined
          rounded
        />
      </div>
    </div>
    <div class="flex items-center gap-2">
      <p>Course titles</p>
      <ToggleSwitch v-model="showCourseTitles" />
    </div>
    <Divider />
    <div class="overflow-x-auto">
      <DataTable
        :value="staff.courses"
        dataKey="session"
        tableStyle="min-width: 0"
        scrollable
        editMode="row"
      >
        <Column style="width: 1rem">
          <template #body="slotProps">
            <Button
              @click="confirmRemoveCourse($event, slotProps.data)"
              icon="pi pi-times"
              outlined
              severity="danger"
              rounded
            />
          </template>
        </Column>

        <Column field="code" header="Code" sortable></Column>

        <Column v-if="showCourseTitles" field="title" header="Title" sortable></Column>
      </DataTable>
    </div>
  </VCard>
</template>
