<script setup>
import { computed, ref } from 'vue'
import { useDate } from '@/composables/utils/format'

const props = defineProps({
  payload: { type: Object, required: true }
})

const result = ref(props.payload.result)

const paginatedStudents = computed(() => {
  const students = result.value.students
  const pageSize = 40
  const pageCount = Math.ceil(students.length / pageSize)

  const paginatedArray = Array.from({ length: pageCount }, (_, index) => {
    const start = index * pageSize
    const end = start + pageSize
    return result.value.students.slice(start, end)
  })
  return paginatedArray
})

//Computes the number of students who got A, B, C, D, E, and F
const numberOfGrades = computed(() => {
  const gradeA = result.value.students.filter(
    (student) => student.grade.toLowerCase() === 'a'
  ).length
  const gradeB = result.value.students.filter(
    (student) => student.grade.toLowerCase() === 'b'
  ).length
  const gradeC = result.value.students.filter(
    (student) => student.grade.toLowerCase() === 'c'
  ).length
  const gradeD = result.value.students.filter(
    (student) => student.grade.toLowerCase() === 'd'
  ).length
  const gradeE = result.value.students.filter(
    (student) => student.grade.toLowerCase() === 'e'
  ).length
  const gradeF = result.value.students.filter(
    (student) => student.grade.toLowerCase() === 'f'
  ).length
  return { gradeA, gradeB, gradeC, gradeD, gradeE, gradeF }
})
//Computes the grade percentage
const percentageGrades = computed(() => {
  const pA =
    Math.round((numberOfGrades.value.gradeA / result.value.students.length) * 100 * 100) / 100
  const pB =
    Math.round((numberOfGrades.value.gradeB / result.value.students.length) * 100 * 100) / 100
  const pC =
    Math.round((numberOfGrades.value.gradeC / result.value.students.length) * 100 * 100) / 100
  const pD =
    Math.round((numberOfGrades.value.gradeD / result.value.students.length) * 100 * 100) / 100
  const pE =
    Math.round((numberOfGrades.value.gradeE / result.value.students.length) * 100 * 100) / 100
  const pF =
    Math.round((numberOfGrades.value.gradeF / result.value.students.length) * 100 * 100) / 100
  return { pA, pB, pC, pD, pE, pF }
})
</script>

<template>
  <!-- style="height: calc(100dvh - 14rem)" -->
  <div id="ogr" class="print-content overflow-auto mt-4">
    <div class="approval">
      <div class="flex items-center gap-2 flex-wrap text-sm font-medium">
        <Button v-if="result.isHODApproved" icon="pi pi-check-circle" text severity="success" />
        <Button v-else-if="result.HODDisapproved.isDisapproved" icon="pi pi-times-circle" text severity="danger" />
        <Button v-else icon="pi pi-question-circle" text />
        <h1 v-if="result.isHODApproved" class="text-green-500">Approved by HOD</h1>
        <h1 v-else-if="result.HODDisapproved.isDisapproved" class="text-red-500">
          Disapproved by HOD. Reason: {{ result.HODDisapproved.reason || 'No reason' }}
        </h1>
        <h1 v-else>
          Pending HOD Approval
        </h1>
      </div>
      <div class="flex items-center gap-2 flex-wrap text-sm font-medium">
        <Button v-if="result.isDeanApproved" icon="pi pi-check-circle" text severity="success" />
        <Button v-else-if="result.deanDisapproved.isDisapproved" icon="pi pi-times-circle" text severity="danger" />
        <Button v-else icon="pi pi-question-circle" text />
        <h1 v-if="result.isDeanApproved" class="text-green-500">Approved by Dean</h1>
        <h1 v-else-if="result.deanDisapproved.isDisapproved" class="text-red-500">
          Disapproved by Dean. Reason: {{ result.deanDisapproved.reason || 'No reason' }}
        </h1>
        <h1 v-else>
          Pending Dean Approval
        </h1>
      </div>
    </div>

    <div v-for="(group, index) in paginatedStudents" :key="index"
      class="result-ogr bg-white text-slate-700 rounded p-5 pb-10 md:gap-2 w-[210mm] border-2">
      <div class="flex items-center gap-2 shrink-0">
        <img src="../../assets/img/futo-log.png" alt="futo-logo" class="w-12 h-auto shrink-0 mb-4" />
        <div class="mx-auto flex flex-col items-center justify-center">
          <h1 class="text-[0.9rem] font-semibold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
          <p class="text-[0.8rem] font-semibold">OFFICIAL GRADE REPORT</p>
        </div>
      </div>

      <div class="flex items-center gap-16 text-[0.63rem]">
        <div>
          <p>School of Student: SICT</p>
          <p>Department: COMPUTER SCIENCE</p>
          <p>Title of Course: {{ result.course.title.toUpperCase() }}</p>
          <p>School Offering Course: {{ result.course.schoolOfferingCourse }}</p>
        </div>

        <div>
          <p>Semester: {{ result.semester }}</p>
          <p>Session: {{ result.session.split('-').join('/') }}</p>
          <div class="flex items-center gap-5">
            <p>Course Code: {{ result.course.code }}</p>
            <p>Units: {{ result.course.unit }}</p>
          </div>
          <p>Date: {{ useDate(result.updatedAt ?? result.approvalDate) }}</p>
        </div>
      </div>

      <div class="mt-4">
        <div class="h-[190mm]">
          <table class="table-bordered text-[0.63rem] w-full">
            <thead class="text-center">
              <tr>
                <th>SN</th>
                <th>NAMES</th>
                <th>REG. NO.</th>
                <th>PROGRAM</th>
                <th>TEST</th>
                <th>LAB</th>
                <th>EXAM</th>
                <th>TOTAL</th>
                <th>GRADE</th>
                <th>RMK</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(student, i) in group" :key="student._id" class="text-center">
                <td>{{ index * 40 + i + 1 }}</td>
                <td v-if="student" class="text-left uppercase">{{ student.name }}</td>
                <td v-if="student">{{ student.regNumber }}</td>
                <td>CSC</td>
                <td v-if="student">{{ student.testScore }}</td>
                <td v-if="student && result.course.hasPractical">{{ student.labScore ?? '-' }}</td>
                <td v-if="student && !result.course.hasPractical">{{ '' }}</td>
                <td v-if="student">{{ student.examScore }}</td>
                <td v-if="student">{{ student.totalScore }}</td>
                <td v-if="student">{{ student.grade }}</td>
                <td v-if="student">{{ student.remark }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-[0.63rem] grid grid-cols-3 mt-7">
          <div class="border-t-2 border-t-black grid place-content-center">Head of Department</div>
          <div class="border-t-2 border-t-black grid place-content-center mt-5">Dean of School</div>
          <div class="border-t-2 border-t-black grid place-content-center">Examiner(s)</div>
        </div>

        <div class="ml-auto mt-4 text-[0.63rem] w-80 border-2 border-black px-4">
          <p class="text-center">Grading System:</p>
          <div class="flex items-center justify-between">
            <div>
              <p>70% and Above: A</p>
              <p>60% - 69%: B</p>
              <p>50% - 59%: C</p>
            </div>
            <div>
              <p>45% - 49%: D</p>
              <p>40% - 44%: E</p>
              <p>Below 40%: F</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-1 text-right text-[0.63rem] italic">page {{ index + 1 }}</div>
    </div>

    <!-- Summary page -->
    <div class="result-ogr bg-white text-slate-700 rounded p-5 pb-10 md:gap-2 w-[210mm] h-[297mm] border-2">
      <div class="flex items-center gap-2 shrink-0">
        <img src="../../assets/img/futo-log.png" alt="futo-logo" class="w-12 h-auto shrink-0 mb-4" />
        <div class="mx-auto flex flex-col items-center justify-center">
          <h1 class="text-[0.9rem] font-semibold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
          <p class="text-[0.8rem] font-semibold">OFFICIAL GRADE REPORT</p>
        </div>
      </div>

      <div class="flex items-center gap-16 text-[0.63rem]">
        <div>
          <p>School of Student: SICT</p>
          <p>Department: COMPUTER SCIENCE</p>
          <p>Title of Course: {{ result.course.title.toUpperCase() }}</p>
          <p>School Offering Course: SICT</p>
        </div>

        <div>
          <p>Semester: {{ result.semester ?? route.params.semester }}</p>
          <p>
            Session:
            {{
            result.session
            ? result.session.split('-').join('/')
            : route.params.session.split('-').join('/')
            }}
          </p>
          <div class="flex items-center gap-5">
            <p>Course Code: {{ result.course.code }}</p>
            <p>Units: {{ result.course.unit }}</p>
          </div>
          <p>Date: {{ useDate(result.updatedAt ?? result.approvalDate) }}</p>
        </div>
      </div>

      <div class="mt-4">
        <div class="h-[190mm]">
          <h1 class="font-semibold text-[0.8rem]">SUMMARY</h1>
          <div>
            <table class="table-bordered text-[0.63rem] w-1/2">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Number of Students</th>
                  <th>Grade Percentage</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr>
                  <td>A</td>
                  <td>{{ numberOfGrades.gradeA }}</td>
                  <td>{{ percentageGrades.pA }}%</td>
                </tr>
                <tr>
                  <td>B</td>
                  <td>{{ numberOfGrades.gradeB }}</td>
                  <td>{{ percentageGrades.pB }}%</td>
                </tr>
                <tr>
                  <td>C</td>
                  <td>{{ numberOfGrades.gradeC }}</td>
                  <td>{{ percentageGrades.pC }}%</td>
                </tr>
                <tr>
                  <td>D</td>
                  <td>{{ numberOfGrades.gradeD }}</td>
                  <td>{{ percentageGrades.pD }}%</td>
                </tr>
                <tr>
                  <td>E</td>
                  <td>{{ numberOfGrades.gradeE }}</td>
                  <td>{{ percentageGrades.pE }}%</td>
                </tr>
                <tr>
                  <td>F</td>
                  <td>{{ numberOfGrades.gradeF }}</td>
                  <td>{{ percentageGrades.pF }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="text-[0.63rem] grid grid-cols-3 mt-7">
          <div class="border-t-2 border-t-black grid place-content-center">Head of Department</div>
          <div class="border-t-2 border-t-black grid place-content-center mt-5">Dean of School</div>
          <div class="border-t-2 border-t-black grid place-content-center">Examiner(s)</div>
        </div>

        <div class="ml-auto mt-4 text-[0.63rem] w-80 border-2 border-black px-4">
          <p class="text-center">Grading System:</p>
          <div class="flex items-center justify-between">
            <div>
              <p>70% and Above: A</p>
              <p>60% - 69%: B</p>
              <p>50% - 59%: C</p>
            </div>
            <div>
              <p>45% - 49%: D</p>
              <p>40% - 44%: E</p>
              <p>Below 40%: F</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-1 text-right text-[0.63rem] italic">
        page {{ paginatedStudents.length + 1 }}
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    visibility: hidden;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .approval {
    display: none;
  }

  .print-content {
    overflow: visible;
    display: grid;
    break-inside: avoid;
    visibility: visible;
    border-radius: 0;
    border: 0;
    box-shadow: none;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
  }

  .result-ogr {
    break-inside: avoid;
    visibility: visible;
    border-radius: 0;
    border: 0;
    box-shadow: none;
    width: 210mm;
    height: 297mm;
  }

  title {
    display: none;
  }
}
</style>
