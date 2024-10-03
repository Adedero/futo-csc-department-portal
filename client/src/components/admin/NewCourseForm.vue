<script setup>
import { computed, ref, watchEffect } from 'vue'
import { faculties } from '@/data/school-data'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  header: { type: String },
  editedCourse: { type: Object },
  isEditing: { type: Boolean, default: false }
})
const emit = defineEmits(['add-course', 'edit-course', 'hide'])

const router = useRouter()
const toast = useToast()

const visible = ref(false)

const loading = ref(false)

const course = ref({
  isElective: false,
  hasPractical: false
})

watchEffect(() => {
  if (props.isEditing) {
    visible.value = true
    course.value = { ...props.editedCourse }
  } else {
    course.value = {
      isElective: false,
      hasPractical: false
    }
  }
})

const disabled = computed(() => {
  return (
    loading.value ||
    !course.value.title ||
    !course.value.code ||
    !course.value.unit ||
    !course.value.level ||
    !course.value.description ||
    !course.value.schoolOfferingCourse ||
    course.value.hasPractical === null ||
    course.value.hasPractical === undefined ||
    course.value.isElective === null ||
    course.value.isElective === undefined ||
    !course.value.semester
  )
})

const newCourse = computed(() => (props.isEditing ? 'no' : 'yes'))

const addCourse = async () => {
  course.value.code = course.value.code.toUpperCase()

  loading.value = true

  await usePost(
    `/api/admin/manage-course?create=${newCourse.value}`,
    { body: course.value, router, toast },
    (data) => {
      newCourse.value === 'yes' ? emit('add-course', data) : emit('edit-course', data)
      course.value = {}
      visible.value = false
    }
  )
  loading.value = false
}

const open = () => (visible.value = true)
</script>

<template>
  <div>
    <slot name="addButton" :open></slot>
    <Dialog
      v-model:visible="visible"
      modal
      :header="isEditing ? 'Edit Course' : 'New Course'"
      class="z-10 max-w-96"
      @hide="$emit('hide')"
    >
      <FormContainer>
        <template #requiredFields>
          <div class="mt-2 grid gap-3 w-80">
            <div class="w-full">
              <label for="full-name" class="text-sm font-medium block">Title</label>
              <InputText
                v-model.trim="course.title"
                id="full-name"
                class="w-full"
                placeholder="Course title"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Code</label>
              <InputMask
                v-model="course.code"
                mask="aaa 999"
                class="w-full"
                placeholder="Course code"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Units</label>
              <InputNumber
                v-model="course.unit"
                :useGrouping="false"
                :min="1"
                :max="20"
                class="w-full"
                placeholder="Course units"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Level</label>
              <Select
                v-model="course.level"
                :options="[100, 200, 300, 400, 500]"
                class="w-full"
                placeholder="Course level"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Semester</label>
              <Select
                v-model="course.semester"
                :options="['HARMATTAN', 'RAIN']"
                class="w-full"
                placeholder="Semester"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">School</label>
              <Select
                v-model="course.schoolOfferingCourse"
                :options="faculties"
                class="w-full"
                placeholder="School oferring course"
              />
            </div>

            <div class="w-full">
              <ToggleButton
                v-model="course.isElective"
                onLabel="ELECTIVE"
                offLabel="COMPULSORY"
                onIcon="pi pi-lock-open"
                offIcon="pi pi-lock"
                class="w-full"
              />
            </div>

            <div class="w-full">
              <ToggleButton
                v-model="course.hasPractical"
                onLabel="LAB"
                offLabel="NO LAB"
                onIcon="pi pi-plus"
                offIcon="pi pi-minus"
                class="w-full"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Description</label>
              <Textarea
                v-model="course.description"
                rows="3"
                auto-resize
                class="w-full"
                placeholder="Course description"
              />
            </div>
          </div>
        </template>
      </FormContainer>
      <Button
        @click="addCourse"
        label="Done"
        icon="pi pi-check"
        :loading
        :disabled="disabled"
        class="mt-2 w-full"
      />
    </Dialog>
  </div>
</template>
