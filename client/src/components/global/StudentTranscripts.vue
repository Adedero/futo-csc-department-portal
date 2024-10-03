<script setup>
import { ref } from 'vue'
import { formatGPA, getHonours } from '@/composables/utils/format'

const props = defineProps({
  transcripts: { type: Object, required: true }
})

const data = ref(props.transcripts)

/* function arrangeTranscriptData(transcriptData) {
  transcriptData.results.forEach((session, index) => {
    let TNU = 0
    let TGP = 0
    session.forEach(semesterResult => {
      TNU += semesterResult.totalUnits;
      TGP += semesterResult.totalGradePoints
    })
    transcriptData.results[index] = {
      TNU: TNU,
      TGP: TGP,
      level: session[0].level,
      results: session,
    }
  })

  transcriptData.results.sort((a, b) => a.level - b.level)

  let prevTNU = 0;
  let prevTGP = 0;
  transcriptData.results.forEach(session => {
    session.prevTNU = prevTNU;
    session.prevTGP = prevTGP;
    prevTNU += session.TNU;
    prevTGP += session.TGP;
  });

  return transcriptData;
} */

function print() {
  window.print()
}
</script>

<template>
  <main class="w-full h-full p-2 overflow-y-auto">
    <VCard>
      <div class="flex items-center gap-3 justify-between">
        <h1 class="font-bold">{{ data.student.user.name }} Transcripts</h1>
        <Button @click="print" label="Print" />
      </div>
    </VCard>

    <div class="mt-2 page grid gap-5">
      <div
        v-for="(session, index) in data.results"
        :key="index"
        class="div w-[210mm] h-[297mm] bp-10 bg-white p-2"
      >
        <div>
          <h1 class="text-xl font-bold text-center">FEDERAL UNIVERSITY OF TECHNOLOGY, OWERRI.</h1>
          <div class="flex justify-center relative">
            <div class="absolute left-44">
              <img src="../../assets/img/futo-log.png" alt="futo_logo" class="w-16" />
            </div>
            <div class="mx-auto font-semibold text-center">
              <p>OFFICE OF THE REGISTRAR</p>
              <p>(Records & Statistics Unit)</p>
              <p>P.M.B. 1526</p>
              <p>Owerri, Nigeria</p>
              <p>STUDENT'S ACADEMIC TRANSCRIPT</p>
            </div>
          </div>
        </div>

        <div class="table-div text-sm grid grid-cols-12 text-center border-t border-t-black">
          <div style="border: 0; border-left: 1px solid black" class="col-span-6">
            Name of Student
          </div>
          <div style="border: 0; border-left: 1px solid black" class="col-span-1">Sex</div>
          <div style="border: 0; border-left: 1px solid black" class="col-span-3">
            Date of Birth
          </div>
          <div
            style="border: 0; border-left: 1px solid black; border-right: 1px solid black"
            class="col-span-2"
          >
            Reg. No.
          </div>

          <div style="border-bottom: 0; border-right: 0" class="col-span-6 uppercase">
            {{ data.student.name ?? '' }}
          </div>

          <div style="border-bottom: 0; border-right: 0" class="col-span-1 uppercase">
            {{ data.student.sex ?? '' }}
          </div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-3 uppercase">
            {{ data.student.dateOfBirth ?? '' }}
          </div>
          <div style="border-bottom: 0" class="col-span-2 uppercase">
            {{ data.student.regNumber ?? '' }}
          </div>

          <div style="border-bottom: 0; border-right: 0" class="col-span-6">Nationality</div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-2">State of Origin</div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-2">Date of Entry</div>
          <div style="border-bottom: 0" class="col-span-2">Mode of Entry</div>

          <div style="border-bottom: 0; border-right: 0" class="col-span-6">
            {{ data.student.nationality ?? 'NIGERIAN' }}
          </div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-2">
            {{ data.student.stateOfOrigin ?? '' }}
          </div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-2">
            {{ data.student.studentClass.className.split('-').join('/') }}
          </div>
          <div style="border-bottom: 0" class="col-span-2">
            {{ data.student.entryMode ?? '' }}
          </div>

          <div style="border-bottom: 0; border-right: 0" class="col-span-6">School</div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-2">Department:</div>
          <div style="border-bottom: 0" class="col-span-4">COMPUTER SCIENCE</div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-6">SICT</div>
          <div style="border-bottom: 0; border-right: 0" class="col-span-2">Option:</div>
          <div style="border-bottom: 0" class="col-span-4">COMPUTER SCIENCE</div>

          <!-- TABLE STARTS HERE -->

          <div style="border-right: 0" class="col-span-1 font-semibold">Course Code</div>
          <div style="border-right: 0" class="col-span-5 font-semibold">Title of course</div>
          <div style="border-right: 0" class="col-span-1 font-semibold">Units</div>
          <div style="border-right: 0" class="col-span-1 font-semibold">Grade</div>
          <div style="border-right: 0" class="col-span-2 font-semibold">Total Grade Points</div>
          <div class="col-span-2 font-semibold">Cum G.P.A</div>

          <div
            v-if="session.prevTGP && session.prevTNU"
            style="border: 0"
            class="col-span-12 grid grid-cols-12"
          >
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-5 border-l border-l-black text-left pl-1 pb-5">
              {{ data.results[index - 1].results[0].session.split('-').join('/') }} B/F
            </div>
            <div class="col-span-1 border-l border-l-black">{{ session.prevTNU }}</div>
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-2 border-l border-l-black">{{ session.prevTGP }}</div>
            <div class="col-span-2 border-x border-x-black"></div>
          </div>

          <div
            v-for="(result, index) in session.results"
            :key="index"
            style="border: 0"
            class="col-span-12 grid grid-cols-12"
          >
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="text-left col-span-5 border-l border-l-black pl-1">
              {{ result.session.split('-').join('/') }}
              {{ result.semester }} SEMESTER
            </div>
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-2 border-l border-l-black"></div>
            <div class="col-span-2 border-x border-x-black"></div>

            <div
              v-for="course in result.courses"
              :key="course.code"
              class="col-span-12 grid grid-cols-12"
            >
              <div class="text-left col-span-1 border-l border-l-black pl-1">
                {{ course.code.split(' ').join('') }}
              </div>
              <div class="text-left col-span-5 pl-1 border-l border-l-black">
                {{ course.title }}
              </div>
              <div class="col-span-1 border-l border-l-black">{{ course.unit }}</div>
              <div class="col-span-1 border-l border-l-black">{{ course.grade }}</div>
              <div class="col-span-2 border-l border-l-black">{{ course.gradePoints }}</div>
              <div class="col-span-2 border-x border-x-black"></div>
            </div>

            <div class="col-span-12 grid grid-cols-12 h-5">
              <div class="col-span-1 border-l border-l-black"></div>
              <div class="col-span-5 border-l border-l-black"></div>
              <div class="col-span-1 border-l border-l-black"></div>
              <div class="col-span-1 border-l border-l-black"></div>
              <div class="col-span-2 border-l border-l-black"></div>
              <div class="col-span-2 border-x border-x-black"></div>
            </div>
          </div>

          <div style="border: 0" class="col-span-12 grid grid-cols-12 h-10">
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-5 border-l border-l-black"></div>
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-2 border-l border-l-black"></div>
            <div class="col-span-2 border-x border-x-black"></div>
          </div>

          <div class="col-span-12 grid grid-cols-12">
            <div class="col-span-1 border-r border-r-black"></div>
            <div class="col-span-5"></div>
            <div class="col-span-1 border-l border-l-black">
              {{ session.TNU + session.prevTNU }}
            </div>
            <div class="col-span-1 border-l border-l-black"></div>
            <div class="col-span-2 border-l border-l-black">
              {{ session.TGP + session.prevTGP }}
            </div>
            <div class="col-span-2 border-l border-l-black">
              {{ formatGPA((session.TGP + session.prevTGP) / (session.TNU + session.prevTNU)) }}
            </div>
          </div>
        </div>

        <div
          v-if="index === data.results.length - 1"
          class="pb-4 border border-t-0 border-black pl-1 text-sm font-semibold"
        >
          <div class="flex items-center gap-2">
            <p>CGPA:</p>
            <p>
              {{ formatGPA((session.TGP + session.prevTGP) / (session.TNU + session.prevTNU)) }}
            </p>
          </div>
          <p>{{ getHonours((session.TGP + session.prevTGP) / (session.TNU + session.prevTNU)) }}</p>
        </div>

        <section class="grid place-content-center text-sm mt-5">
          <h1 class="uppercase text-center font-semibold">GRADING SYSTEM</h1>
          <div class="grid grid-cols-4 gap-x-6">
            <div>A - Excellent:</div>
            <div>5 points</div>

            <div>D - Pass:</div>
            <div>2 points</div>

            <div>B - Very Good:</div>
            <div>4 points</div>

            <div>E - Poor Pass:</div>
            <div>1 point</div>

            <div>C - Good:</div>
            <div>3 points</div>

            <div>F - Failure:</div>
            <div>0 points</div>
          </div>

          <div class="flex items-center gap-5">
            <p>I - Incomplete</p>
            <p>W - Withdrew</p>
            <p>WP - Withdrew Passing</p>
            <p>WF - Withdrew Failing</p>
          </div>
        </section>

        <section class="flex items-center justify-center gap-20 mt-10 text-[0.9rem">
          <div class="text-center font-semibold">
            <p>ODISA C. OKEKE (MRS.)</p>
            <hr class="border-black w-60" />
            <p>FOR: REGISTRAR</p>
          </div>

          <div class="text-center font-semibold">
            <br />
            <hr class="border-black w-60" />
            <p>DATE</p>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.table-div > div {
  border: 1px solid black;
}
</style>

<style>
@media print {
  body {
    visibility: hidden;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .page {
    break-inside: avoid;
    visibility: visible;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
  }

  .div {
    height: 297mm;
  }

  title {
    display: none;
  }
}
</style>
