<script setup>
import { useRoute, useRouter } from 'vue-router'
import Message from 'primevue/message'
import { useToast } from 'vue-toast-notification'
import { formatGPA } from '@/composables/utils/format'
import { useGet } from '@/composables/server/use-fetch'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data } = await useGet(
  `/api/advisor/class-result-all-courses?session=${route.params.session}&semester=${route.params.semester}&level=${route.params.level}`,
  { router, toast }
)

let CUR = ['CURRENT TGP', 'CURRENT TNU', 'CURRENT GPA']
let PRE = ['PREVIOUS TGP', 'PREVIOUS TNU', 'PREVIOUS GPA']
let CUM = ['CUM TGP', 'CUM TNU', 'CUM GPA']

function getGrade(record, course) {
  let grade = ''
  record.courses.forEach((c) => {
    if (c.code == course.code) {
      grade = c.grade
    }
  })
  return grade
}

function getRemark(courses) {
  //let remark = ''
  let num = 0
  courses.forEach((course) => {
    if (course.remark === 'FAIL') {
      num += 1
    }
  })

  if (!num) {
    return 'PASS'
  } else {
    return `${num}F`
  }
}

function print() {
  window.print()
}
</script>

<template>
  <main v-if="data" class="w-dvw lg:w-full h-full md:flex overflow-y-auto p-5">
    <Card class="w-dvw md:w-full">
      <template #title>
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h1>
            {{
              `${route.params.session.split('-').join('/')} Session - ${route.params.level} Level - ${route.params.semester} Semester Results`
            }}
          </h1>
          <Button @click="print" label="Print" />
        </div>
      </template>

      <template #content>
        <div style="height: calc(100dvh - 13.5rem)" class="print-content overflow-auto mt-4">
          <table class="table-bordered text-[0.6rem] whitespace-nowrap w-full text-black">
            <thead>
              <tr>
                <th>
                  <br />
                  <p>SN</p>
                </th>
                <th>
                  <br />
                  <p>REG. NO.</p>
                </th>
                <th v-for="course in data.courses" :key="course.code">
                  <p>{{ course.code }}</p>
                  <p>{{ course.unit }}</p>
                </th>
                <th v-for="c in CUR" :key="c">
                  <p>{{ c.split(' ')[0] }}</p>
                  <p>{{ c.split(' ')[1] }}</p>
                </th>
                <th v-for="p in PRE" :key="p">
                  <p>{{ p.split(' ')[0] }}</p>
                  <p>{{ p.split(' ')[1] }}</p>
                </th>
                <th v-for="c in CUM" :key="c">
                  <p>{{ c.split(' ')[0] }}</p>
                  <p>{{ c.split(' ')[1] }}</p>
                </th>
                <th>RMK</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(record, index) in data.records" :key="record._id" class="text-center">
                <td>{{ index + 1 }}</td>
                <td :title="record.student.user.name">{{ record.student.regNumber }}</td>
                <td v-for="course in data.courses" :key="course.code">
                  {{ getGrade(record, course) }}
                </td>
                <td>{{ record.totalGradePoints }}</td>
                <td>{{ record.totalUnits }}</td>
                <td>{{ formatGPA(record.GPA) }}</td>
                <td>{{ record.previousTGP ?? '' }}</td>
                <td>{{ record.previousTNU ?? '' }}</td>
                <td>{{ !record.previousGPA ? '' : formatGPA(record.previousGPA) }}</td>
                <td>{{ record.cumTGP ?? record.totalGradePoints }}</td>
                <td>{{ record.cumTNU ?? record.totalUnits }}</td>
                <td>
                  {{
                    isNaN(formatGPA(record.cumGPA))
                      ? formatGPA(record.GPA)
                      : formatGPA(record.cumGPA)
                  }}
                </td>
                <td>{{ getRemark(record.courses) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Card>
  </main>

  <main v-else class="grid h-full place-content-center">
    <Message class="p-5" icon="pi pi-info-circle" :closable="false">
      No results found for SESSION {{ route.params.session }},
      {{ route.params.semester.toUpperCase() }}, {{ route.params.level }} level.
    </Message>
  </main>
</template>

<style scoped>
.table-bordered th,
.table-bordered td {
  padding: 0.25rem;
}
</style>
