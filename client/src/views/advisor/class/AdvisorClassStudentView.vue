<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGet } from '@/composables/server/use-fetch'
import { useToast } from 'vue-toast-notification'
import { formatGPA, getNumberOfCourses } from '@/composables/utils/format'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { data: student } = await useGet(`/api/advisor/student-profile/${route.params.id}`, {
  router,
  toast
})

const groupedCourses = computed(() => {
  return student.value.registeredCourses.reduce((acc, record) => {
    const existingIndex = acc.findIndex(
      (group) => group.session === record.session && group.level === record.level
    )
    if (existingIndex !== -1) {
      acc[existingIndex].courses.push(...record.courses)
    } else {
      acc.push({
        _id: record._id,
        session: record.session,
        level: record.level,
        courses: [...record.courses]
      })
    }
    return acc
  }, [])
})

const goToRecord = (record) =>
  router.push(`/advisor/student-course-registration-details/${record._id}`)

//Transcript generation
let loading = ref(false)
async function goToTranscript() {
  loading.value = true

  await useGet(
    `/api/advisor/check-transcripts?studentId=${student.value._id}`,
    { router, toast },
    (payload) => {
      if (payload.transcripts) {
        router.push({
          name: 'advisor-student-transcripts',
          params: {
            id: student.value._id
          }
        })
        return
      }
      toast.info('No transcripts are available for this student yet.', {
        position: 'top-right',
        duration: 5000
      })
      return
    }
  )
  loading.value = false
}
</script>

<template>
  <main
    class="w-full h-full overflow-y-auto p-2 grid content-start gap-3 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-9"
  >
    <VCard class="h-fit md:col-span-10 lg:col-span-12 xl:col-span-9">
      <h1 class="font-bold text-xl">Student Profile</h1>
    </VCard>

    <aside class="md:col-span-3 lg:col-span-3 xl:col-span-2">
      <div class="w-full h-full text-center flex flex-col gap-5 items-center">
        <div class="w-28 md:w-32 aspect-square rounded-full">
          <VAvatar :image="student.image" rounded fluid />
        </div>
        <div>
          <h1 class="font-semibold text-lg">{{ student.name }}</h1>
          <p class="font-medium">{{ student.regNumber }}</p>
          <p class="text-sm">{{ student.level }} Level</p>
          <Divider />
          <Button label="Generate Transcripts" @click="goToTranscript" :loading />
        </div>
      </div>
    </aside>

    <div
      class="h-[calc(100dvh-10rem)] grid gap-3 md:overflow-y-auto md:col-span-7 lg:col-span-9 xl:col-span-7"
    >
      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-user" style="font-size: 0.9rem"></span>
          <h1 class="font-semibold">Personal Information</h1>
        </div>
        <Divider />
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div class="grid gap-1 lg:col-span-2">
            <label for="username" class="text-sm font-medium">Username</label>
            <InputText :value="student.username" readonly type="text" id="username" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="date-of-birth" class="text-sm font-medium">Date of Birth</label>
            <InputText :value="student.dateOfBirth" readonly type="text" id="date-of-birth" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="sex" class="text-sm font-medium">Sex</label>
            <InputText :value="student.sex" readonly type="text" id="sex" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="phone-number" class="text-sm font-medium">Phone Number</label>
            <InputText :value="student.phoneNumber" readonly type="text" fluid />
          </div>
          <div class="grid gap-1 md:col-span-2 lg:col-span-4">
            <label for="email" class="text-sm font-medium">Email</label>
            <InputText :value="student.email" readonly type="text" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-3">
            <label for="nationality" class="text-sm font-medium">Nationality</label>
            <InputText :value="student.nationality" readonly type="text" id="nationality" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-3">
            <label for="state-of-origin" class="text-sm font-medium">State of Origin</label>
            <InputText
              :value="student.stateOfOrigin"
              readonly
              type="text"
              id="state-of-origin"
              fluid
            />
          </div>

          <div class="grid gap-1 md:col-span-2 lg:col-span-6">
            <label for="address" class="text-sm font-medium">Home Address</label>
            <InputText :value="student.address" readonly type="text" id="address" fluid />
          </div>
        </div>
      </VCard>

      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-graduation-cap"></span>
          <h1 class="font-semibold">Academic Information</h1>
        </div>
        <Divider />
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div class="grid gap-1 lg:col-span-2">
            <label for="class" class="text-sm font-medium">Class</label>
            <InputText :value="student.studentClass" readonly type="text" id="class" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="level" class="text-sm font-medium">Level</label>
            <InputText :value="student.level" readonly type="text" id="level" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="entry-mode" class="text-sm font-medium">Entry Mode</label>
            <InputText :value="student.entryMode" readonly type="text" id="entry-mode" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="cgpa" class="text-sm font-medium">CGPA</label>
            <InputText :value="formatGPA(student.CGPA)" readonly type="text" id="cgpa" fluid />
          </div>
          <div class="grid gap-1 md:col-span-2 lg:col-span-4">
            <label for="class-advisor" class="text-sm font-medium">Class Advisor</label>
            <InputText :value="student.advisor" readonly type="text" id="class-advisor" fluid />
          </div>
        </div>
      </VCard>

      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-book"></span>
          <h1 class="font-semibold">Outstanding Courses</h1>
        </div>
        <Divider />

        <div class="max-w-full overflow-auto">
          <DataTable
            :value="student.outstandingCourses"
            dataKey="code"
            tableStyle="min-width: 0; whitespace: wrap"
          >
            <Column field="code" header="Course" sortable></Column>

            <Column field="title" header="Title" sortable></Column>

            <Column field="session" header="Session"></Column>

            <Column field="semester" header="Semester"></Column>
          </DataTable>
        </div>
      </VCard>

      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-book"></span>
          <h1 class="font-semibold">Registered Courses</h1>
        </div>
        <Divider />

        <div class="max-w-full overflow-auto">
          <DataTable
            :value="groupedCourses"
            dataKey="session"
            tableStyle="min-width: 0; whitespace: wrap"
          >
            <Column field="session" header="Session" sortable></Column>

            <Column field="level" header="Level" sortable></Column>

            <Column field="courses" header="Harmattan">
              <template #body="slotProps">
                {{ getNumberOfCourses(slotProps.data.courses).har }}
              </template>
            </Column>

            <Column field="courses" header="Rain">
              <template #body="slotProps">
                {{ getNumberOfCourses(slotProps.data.courses).rain }}
              </template>
            </Column>

            <Column>
              <template #body="slotProps">
                <Button
                  @click="goToRecord(slotProps.data)"
                  label="Details"
                  icon="pi pi-eye"
                  outlined
                  rounded
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </VCard>
    </div>
  </main>
</template>
