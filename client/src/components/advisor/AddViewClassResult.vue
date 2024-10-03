<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  staffId: { type: String, required: true },
  sessions: { type: Array, required: true },
  courses: { type: Array, required: true },
  model: { type: String, default: 'advisor' },
  type: { type: String, default: 'view' }
})

const router = useRouter()

const query = ref({
  session: {},
  semester: '',
  level: 0,
  course: null
})

const semesters = ref(['HARMATTAN', 'RAIN'])
const levels = ref([100, 200, 300, 400, 500])
const allCourses = ref([
  { _id: 1, code: 'ALL COURSES', semester: 'HARMATTAN RAIN', level: 'ALL' },
  ...props.courses
])

const filteredCourses = computed(() => {
  if (props.type === 'view') {
    return allCourses.value.filter((course) => {
      return (
        (course.semester.toLowerCase().includes(query.value.semester.toLowerCase()) &&
          course.level === query.value.level) ||
        course.level === 'ALL'
      )
    })
  }

  if (props.type === 'add') {
    return props.courses.filter((course) => {
      return (
        course.semester.toLowerCase().includes(query.value.semester.toLowerCase()) &&
        course.level == query.value.level
      )
    })
  }
  return []
})

function addResult() {
  router.push({
    name: `${props.model}-add-class-result`,
    params: {
      staffId: props.staffId,
      session: query.value.session.name,
      semester: query.value.semester,
      level: query.value.level,
      course: query.value.course.code.split(' ').join('-')
    }
  })
}

function viewResult() {
  if (query.value.course.code == 'ALL COURSES') {
    router.push({
      name: `${props.model}-class-all-courses-result`,
      params: {
        session: query.value.session.name,
        semester: query.value.semester,
        level: query.value.level
      }
    })
  } else {
    router.push({
      name: `${props.model}-class-ogr-result`,
      params: {
        session: query.value.session.name,
        semester: query.value.semester,
        level: query.value.level,
        course: query.value.course.code.split(' ').join('-')
      }
    })
  }
}
</script>

<template>
  <div>
    <div v-if="type === 'view'">
      <div class="mt-1 grid gap-3">
        <div class="grid">
          <label class="text-sm font-semibold">Session</label>
          <Select
            v-model="query.session"
            :options="sessions"
            option-label="name"
            placeholder="Select Session"
          />
        </div>

        <div class="grid">
          <label class="text-sm font-semibold">Semester</label>
          <Select v-model="query.semester" :options="semesters" placeholder="Select Semester" />
        </div>

        <div class="grid">
          <label class="text-sm font-semibold">Level</label>
          <Select v-model="query.level" :options="levels" placeholder="Select Level" />
        </div>

        <div class="grid">
          <label class="text-sm font-semibold">Course</label>
          <Select
            v-model="query.course"
            :options="filteredCourses"
            option-label="code"
            placeholder="Select Course"
            editable
          />
        </div>
        <div class="grid">
          <Button
            @click="viewResult"
            label="View Result"
            :disabled="!query.session.name || !query.semester || !query.course"
          />
        </div>
      </div>
    </div>

    <div v-if="type === 'add'">
      <div class="mt-1 grid gap-3">
        <div class="grid">
          <label class="text-sm font-semibold">Session</label>
          <Select
            v-model="query.session"
            :options="sessions"
            option-label="name"
            placeholder="Select Session"
          />
        </div>

        <div class="grid">
          <label class="text-sm font-semibold">Semester</label>
          <Select v-model="query.semester" :options="semesters" placeholder="Select Semester" />
        </div>

        <div class="grid">
          <label class="text-sm font-semibold">Level</label>
          <Select v-model="query.level" :options="levels" placeholder="Select Level" />
        </div>

        <div class="grid">
          <label class="text-sm font-semibold">Course</label>
          <Select
            v-model="query.course"
            :options="filteredCourses"
            option-label="code"
            placeholder="Select Course"
            editable
          />
        </div>

        <div class="grid">
          <Button
            @click="addResult"
            label="Add Result"
            :disabled="!query.session.name || !query.semester || !query.course"
          />
        </div>
      </div>
    </div>
  </div>
</template>
