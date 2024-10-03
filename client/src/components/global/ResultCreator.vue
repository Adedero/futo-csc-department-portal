<script setup>
import { ref } from 'vue'
import {
  studentTotal,
  studentGrade,
  studentRemark,
  saveProgress,
  displaySavedResults
} from '@/composables/utils/result-creation'
import { onMounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'

const props = defineProps({
  iaAddedByAdvisor: { type: Boolean, default: false },
  payload: { type: Object, required: true },
  course: { type: Object, required: true },
  records: { type: Array, required: true },
  model: { type: String, required: true, default: 'staff' }
})

const refRecords = ref(props.records)

const router = useRouter()
const toast = useToast()

//Makes sure only numbers are input
function sanitize(event) {
  if (event.target.value === 'string' || event.target.value === '') {
    event.target.value = event.target.value.slice(0, -1)
  }
}

const loading = ref(false)
const addResult = async () => {
  const studentRecords = refRecords.value.map((record) => {
    return {
      studentId: record._id,
      studentClassId: record.studentClassId,
      regNumber: record.regNumber,
      name: record.name,
      testScore: record.testScore,
      labScore: record.labScore,
      examScore: record.examScore,
      totalScore: record.total,
      grade: record.grade,
      remark: record.remark,
      year: record.year
    }
  })

  const courseRecord = {
    code: props.course.code,
    title: props.course.title,
    unit: props.course.unit,
    level: props.course.level,
    schoolOfferingCourse: props.course.schoolOfferingCourse,
    isElective: props.course.isElective,
    hasPractical: props.course.hasPractical
  }

  const newResult = {
    staffId: props.payload.staffId,
    session: props.payload.session,
    semester: props.payload.semester,
    level: parseInt(props.payload.level),
    course: courseRecord,
    students: [...studentRecords],
    isAddedByAdvisor: props.isAddedByAdvisor
  }

  loading.value = true
  await usePost(
    `/api/${props.model}/add-result`,
    {
      body: newResult,
      toast,
      router,
      toastOnSuccess: true,
      duration: 3000
    },
    (data) => {
      if (data.existing) {
        setTimeout(
          () =>
            router.push({
              name: `${props.model}-edit-result`,
              params: { resultId: data.resultId }
            }),
          3000
        )
        return
      }
      localStorage.removeItem(`result_${props.course._id}`)
      setTimeout(
        () =>
          router.push({ name: `${props.model}-ogr-result`, params: { resultId: data.resultId } }),
        3000
      )
    }
  )
  loading.value = false
}

onMounted(() => displaySavedResults(refRecords.value, props.course))
</script>

<template>
  <VCard>
    <div style="height: calc(100dvh - 16.5rem)" class="table-container overflow-auto">
      <table class="table-edit text-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Reg. Number</th>
            <th class="w-20 text-center">Test</th>
            <th v-if="course.hasPractical" class="w-24 text-center">Practical</th>
            <th class="w-20 text-center">Exam</th>
            <th class="w-16 text-center">Total</th>
            <th class="w-16 text-center">Grade</th>
            <th class="w-16 text-center">Remark</th>
            <th class="w-16"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="student in refRecords" :key="student._id">
            <td>{{ student.name }}</td>
            <td>{{ student.regNumber }}</td>
            <td>
              <input
                v-model="student.testScore"
                class="result-input"
                type="number"
                @input="sanitize"
              />
            </td>
            <td v-if="course.hasPractical">
              <input
                v-model="student.labScore"
                class="result-input"
                type="number"
                @input="sanitize"
              />
            </td>
            <td>
              <input
                v-model="student.examScore"
                class="result-input"
                type="number"
                @input="sanitize"
              />
            </td>
            <td>
              <input
                :value="studentTotal(student, course)"
                readonly
                class="outline-none w-full h-8 p-2 bg-transparent"
              />
            </td>
            <td>
              <input
                :value="studentGrade(student, course)"
                readonly
                class="outline-none w-full h-8 p-2 bg-transparent"
                type="text"
              />
            </td>
            <td>
              <input
                :value="studentRemark(student, course)"
                readonly
                class="outline-none w-full h-8 p-2 bg-transparent"
                type="text"
              />
            </td>
            <td>
              <Button
                @click="saveProgress(student, course, toast)"
                outlined
                label="Save"
                class="h-8"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-2 grid justify-end">
      <Button label="Done" icon="pi pi-check" @click="addResult" :loading />
    </div>
  </VCard>
</template>

<style scoped>
.result-input {
  outline: none;
  border: 1px solid var(--p-surface-300);
  min-width: 3rem;
  width: 100%;
  height: 2rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: border 0.3s ease;
  text-align: center;
}

.result-input:hover {
  border: 1px solid var(--p-surface-400);
}

.result-input:focus {
  border: 1px solid var(--p-primary-color);
}
</style>
