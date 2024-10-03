<script setup>
import { useGet } from '@/composables/server/use-fetch';
import { formatGPA } from '@/composables/utils/format';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

const { data: result } = await useGet(`/api/student/result/${route.params.id}`, { router, toast });

const print = () => window.print();
</script>

<template>
  <main class="p-2 w-full h-full overflow-y-auto">
    <VCard>
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-bold">{{ `${result.session.split('-').join('/')} ${result.semester} Result` }}</h1>
        <Button @click="print" label="Print" />
      </div>
      <Message class="mt-2" :closable="false">Unoffical result. For personal use only.</Message>

      <div class="student-result-container mt-4 text-black overflow-auto lg:flex lg:justify-center">
        <div class="result border-2 w-[210mm] h-fit shrink-0 px-10 py-20">
          <header class="text-center">
            <h1 class="text-lg font-bold">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI</h1>
            <p class="font-semibold">UNOFFICIAL STUDENT'S RESULT</p>
          </header>

          <div class="subheader mt-16 grid grid-cols-2 gap-3 text-sm font-semibold">

            <div class="col-span-2 grid grid-cols-4 gap-3">
              <p class="col-span-2 p-1 border border-black">NAME OF STUDENT</p>
              <p class="col-span-2 p-1 border border-black">{{ userStore.user.name }}</p>
            </div>
            <div class="border border-black grid grid-cols-2">

              <p class="p-1 border-b border-b-black border-r border-r-black">REG. NO.</p>
              <p class="p-1 border-b border-b-black">{{ result.student.regNumber }}</p>
              <p class="p-1 border-b border-b-black border-r border-r-black">SESSION</p>
              <p class="p-1 border-b border-b-black">{{ result.session.split('-').join('/') }}</p>
              <p class="p-1 border-r border-r-black">SEMESTER</p>
              <p class="p-1">{{ result.semester }}</p>
            </div>

            <div class="border border-black grid grid-cols-2">
              <p class="p-1 border-b border-b-black border-r border-r-black">SCHOOL</p>
              <p class="p-1 border-b border-b-black">SICT</p>
              <p class="p-1 border-b border-b-black border-r border-r-black">DEPARTMENT</p>
              <p class="p-1 border-b border-b-black">CSC</p>
              <p class="p-1 border-r border-r-black">YEAR</p>
              <p class="p-1">{{ result.year }}</p>
            </div>
          </div>

          <div class="table-container mt-10">
            <table class="table-bordered w-full text-sm">
              <thead>
                <th class="p-2">COURSE CODE</th>
                <th class="p-2">UNITS</th>
                <th class="p-2">LAB</th>
                <th class="p-2">TEST</th>
                <th class="p-2">EXAM</th>
                <th class="p-2">TOTAL</th>
                <th class="p-2">GRADE</th>
                <th class="p-2">GRADE POINT</th>
                <th class="p-2">REMARK</th>
              </thead>
              <tbody>
                <tr v-for="course in result.courses" :key="course._id" class="text-center">
                  <td class="p-2 text-left">{{ course.code }}</td>
                  <td class="p-2">{{ course.unit }}</td>
                  <td class="p-2">
                    {{ !course.hasPractical ? 'N/A' : course.labScore ?? '-' }}
                  </td>
                  <td class="p-2">{{ course.testScore ?? '-' }}</td>
                  <td class="p-2">{{ course.examScore ?? '-' }}</td>
                  <td class="p-2">{{ course.totalScore ?? '-' }}</td>
                  <td class="p-2">{{ course.grade }}</td>
                  <td class="p-2">{{ course.gradePoints ?? 0 }}</td>
                  <td class="p-2">{{ course.remark }}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary border grid grid-cols-3 text-sm border-black p-3 mt-10">
              <div class="flex items-center gap-2">
                <p>TOTAL GRADE POINTS:</p>
                <p class="font-semibold">{{ result.totalGradePoints }}</p>
              </div>

              <div class="flex items-center gap-2">
                <p>TOTAL UNITS:</p>
                <p class="font-semibold">{{ result.totalUnits }}</p>
              </div>

              <div class="flex items-center gap-2">
                <p>GPA:</p>
                <p class="font-semibold">{{ formatGPA(result.GPA) }}</p>
              </div>
            </div>
          </div>
        </div>
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

  .student-result-container {
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
  }

  .result {
    break-inside: avoid;
    visibility: visible;
    border-radius: 0;
    border: 0;
    box-shadow: none;
    width: 210mm;
  }

  title {
    display: none;
  }

}
</style>