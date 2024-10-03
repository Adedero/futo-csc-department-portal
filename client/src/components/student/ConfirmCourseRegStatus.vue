<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  courseRegStatus: { type: Object, required: true },
  studentClass: { type: Object, required: true }
})

const router = useRouter()

const openLevels = computed(() => {
  const levels = props.courseRegStatus.openLevels
  const levelsSet = [...new Set([props.studentClass.currentLevel, ...levels])].sort()
  return levelsSet
});

const openSessions = computed(() => {
  return props.courseRegStatus.openSessions.toSorted((a, b) => {
    const startA = parseInt(a.split("-")[0])
    const startB = parseInt(b.split("-")[0])
    return startB - startA;
  });
})

const visible = ref(false)
const isVisible = ref(false)
const loading = ref(false)

const session = ref(null)
const semester = ref(null)
const level = ref(null)

const goToCourseReg = () => {
  router.push({
    name: 'course-registration',
    params: {
      session: session.value,
      semester: semester.value.toLowerCase(),
      level: level.value
    }
  })
}
</script>

<template>
  <div>
    <Dialog v-model:visible="isVisible" modal header="Closed" :style="{ width: '22rem' }">
      <div>
        Course registration has been closed for this semester. <br />
        Please, visit the admin office for more information.
      </div>
      <div class="mt-5">
        <Button type="button" label="OK" class="w-20" @click="isVisible = false"></Button>
      </div>
    </Dialog>

    <Dialog v-model:visible="visible" modal header="Register Courses" :style="{ width: '22rem' }">
      <div class="flex flex-col gap-1">
        <label class="font-semibold w-6rem">Session</label>
        <Select
          v-model="session"
          :options="openSessions"
          placeholder="Session"
          class="w-full md:w-14rem"
        />
      </div>

      <div class="flex flex-col gap-1 mt-5">
        <label class="font-semibold w-6rem">Semester</label>
        <Select
          v-model="semester"
          :options="courseRegStatus.openSemesters"
          placeholder="Semester"
          class="w-full md:w-14rem"
        />
      </div>

      <div class="flex flex-col gap-1 mt-5">
        <label class="font-semibold w-6rem">Level</label>
        <Select
          v-model="level"
          :options="openLevels"
          placeholder="Level"
          class="w-full md:w-14rem"
        />
      </div>

      <div class="flex justify-content-end gap-2 mt-5">
        <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
        <Button
          type="button"
          label="Submit"
          @click="goToCourseReg"
          :loading="loading"
          :disabled="loading || !level || !semester || !session"
        >
        </Button>
      </div>
    </Dialog>
    <Button
      @click="courseRegStatus.isOpen ? (visible = true) : (isVisible = true)"
      label="Register Courses"
    />
  </div>
</template>
