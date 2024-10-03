<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const props = defineProps({
  semester: { type: String, required: true },
  actualLevel: { type: Number, required: true }
})

const emit = defineEmits(['add-courses'])

const visible = ref(false)
const open = ref(false)

const courses = ref([])
const level = ref(null)

const availableLevels = computed(() =>
  [100, 200, 300, 400, 500].filter((x) => x <= props.actualLevel)
)

const loading = ref(false)
const getBorrowedCourses = async () => {
  if (level.value === props.actualLevel) {
    open.value = false
    return
  }
  loading.value = true
  await useGet(
    `/api/student/get-borrowed-courses?level=${level.value}&semester=${props.semester}`,
    { router, toast },
    (data) => {
      courses.value = [...data]
      visible.value = true
    }
  )
  loading.value = false
}

const addBorrowedCourses = () => {
  if (!courses.value.length) {
    return
  }
  emit('add-courses', courses.value)
  visible.value = false
  open.value = false
  level.value = null
}
</script>

<template>
  <div>
    <Button @click="open = true" label="Add/Borrow Courses" />
    <Dialog v-model:visible="open" modal header="Add or Borrow Courses" :style="{ width: '24rem' }">
      <div class="grid gap-1">
        <label for="level" class="font-semibold">Level</label>
        <Select
          id="level"
          v-model="level"
          :options="availableLevels"
          placeholder="Level"
          class="w-full md:w-14rem"
        />
      </div>

      <div class="flex justify-end gap-2 mt-5">
        <Button type="button" label="Cancel" severity="secondary" @click="open = false"></Button>
        <Button
          type="button"
          label="Submit"
          @click="getBorrowedCourses"
          :loading="loading"
          :disabled="loading || !level"
        >
        </Button>
      </div>
    </Dialog>

    <Drawer v-model:visible="visible" header="Add Courses" position="right" class="md:w-[30rem]">
      <div v-if="!courses.length">
        <p class="font-bold text-red-500">No courses found!</p>
      </div>
      <div v-else>
        <div class="mt-3">
          <Button @click="addBorrowedCourses" label="Add" />
        </div>
        <ul>
          <li
            v-for="course in courses"
            :key="course.code"
            class="flex gap-2 border p-2 rounded mt-3"
          >
            <div>
              <Checkbox v-model="course.isSelected" :binary="true" />
            </div>
            <div>
              <p class="font-bold">{{ course.code }}</p>
              <p class="text-sm">{{ course.title }}</p>
            </div>
          </li>
        </ul>
      </div>
    </Drawer>
  </div>
</template>
