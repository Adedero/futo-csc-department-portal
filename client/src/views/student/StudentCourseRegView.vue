<script setup>
import { computed, ref } from 'vue'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data } = await useGet(
  `/api/student/courses-to-register/${route.params.session}/${route.params.semester}/${route.params.level}`,
  { router, toast }
)

const selectedCourses = computed(() => {
  return data.value.courses
    .filter((course) => course.isSelected)
    .map((course) => ({
      code: course.code,
      title: course.title,
      isElective: course.isElective,
      unit: course.unit
    }))
})

const minAndMaxUnits = computed(() => {
  if (data.value.semester === 'HARMATTAN') {
    return {
      minUnits: data.value.level.harmattanMinCreditUnits,
      maxUnits: data.value.level.harmattanMaxCreditUnits
    }
  }
  if (data.value.semester === 'RAIN') {
    return {
      minUnits: data.value.level.rainMinCreditUnits,
      maxUnits: data.value.level.rainMaxCreditUnits
    }
  }
  return {}
})

//COMPUTED THE TOTAL UNITS OF SELECTED COURSES
const totalUnits = computed(() => {
  return data.value.courses.reduce((count, course) => {
    return course.isSelected ? count + course.unit : count
  }, 0)
})

//GETS THE CORRECT COLOR FOR THE TOTAL SELECTED UNITS
const totalUnitsColor = computed(() => {
  if (
    totalUnits.value < minAndMaxUnits.value.minUnits ||
    totalUnits.value > minAndMaxUnits.value.maxUnits
  ) {
    return 'text-red-500'
  }
  return 'text-green-500'
})

const loading = ref(false)

const registerCourses = async () => {
  if (totalUnits.value < minAndMaxUnits.value.minUnits) {
    toast.warning('You must register at least ' + minAndMaxUnits.value.minUnits + ' units', {
      position: 'top-right',
      duration: 5000
    })
    return
  }
  if (totalUnits.value > minAndMaxUnits.value.maxUnits) {
    return toast.warning(
      'You cannot register more than ' + minAndMaxUnits.value.maxUnits + ' units',
      { position: 'top-right', duration: 5000 }
    )
  }

  let courseRegDetails = {
    courses: selectedCourses.value,
    session: data.value.session,
    semester: data.value.semester,
    level: data.value.level.name,
    year: data.value.year,
    totalUnits: totalUnits.value
  }

  loading.value = true

  await usePost(
    '/api/student/register-courses',
    {
      body: courseRegDetails,
      router,
      toast,
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    () => {
      setTimeout(() => {
        router.push({ name: 'student-courses' })
      }, 2000)
    }
  )
  loading.value = false
}
</script>

<template>
  <main class="w-full h-full overflow-y-auto p-2">
    <VCard>
      <div class="flex items-center gap-3 justify-between">
        <h1 class="text-lg font-bold">Course Registration</h1>
        <BorrowCourses
          @add-courses="(courses) => data.courses.unshift(...courses)"
          :semester="data.semester"
          :actual-level="data.level.name"
        />
      </div>
      <p>
        Total units selected:
        <span :class="['font-bold', totalUnitsColor]">{{ totalUnits }}</span>
        out of
        <span class="font-bold">{{ minAndMaxUnits.maxUnits }}</span>
        max units
      </p>
    </VCard>

    <VCard class="mt-2">
      <div class="max-h-[calc(100dvh-17.5rem)] overflow-scroll rounded-md table-container">
        <table class="table text-sm" style="white-space: wrap">
          <thead class="z-10">
            <tr>
              <th>Select</th>
              <th>Code</th>
              <th>Title</th>
              <th>Units</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in data.courses" :key="course._id">
              <td class="w-5">
                <Checkbox v-model="course.isSelected" :binary="true" />
              </td>
              <td class="w-32">{{ course.code }}</td>
              <td>{{ course.title }}</td>
              <td class="w-20">{{ course.unit }}</td>
              <td class="w-20">{{ course.isElective ? 'ELELCTIVE' : 'COMPULSORY' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-2">
        <Button label="Register" @click="registerCourses" :loading="loading" />
      </div>
    </VCard>
  </main>
</template>
