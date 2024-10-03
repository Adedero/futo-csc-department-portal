<script setup>
import { ref } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { formatGPA } from '@/composables/utils/format'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const visible = ref(false)
const course = ref({})

const { data } = await useGet('/api/advisor/dashboard-info', { router, toast })

const viewDetails = (data) => {
  course.value = { ...data }
  visible.value = true
}

const addResult = (course) => {
  router.push({
    name: 'advisor-add-result',
    params: {
      staffId: data.value.staff._id,
      session: data.value.currentSession.name,
      semester: data.value.currentSemester.name,
      level: course.level,
      course: course.code.split(' ').join('-')
    }
  })
}
</script>

<template>
  <main class="h-full overflow-y-auto w-full p-2">
    <VCard>
      <h1 class="font-bold text-xl">Dashboard</h1>
    </VCard>

    <section class="mt-2 grid gap-2 md:grid-cols-6">
      <VCard class="md:col-span-3 lg:col-span-4 flex items-center gap-2">
        <div class="w-28">
          <VAvatar :image="userStore.user.image" rounded fluid />
        </div>

        <div>
          <p>
            Welcome, <span class="font-semibold text-lg">{{ userStore.user.title }}</span>
          </p>
          <p class="text-2xl font-semibold text-[--p-primary-500]">{{ userStore.user.name }}</p>
          <p>{{ data.staff.staffId }}</p>

          <p class="text-xs text-slate-600">STAFF</p>
        </div>
      </VCard>

      <DashboardCard
        class="md:col-span-3 lg:col-span-2"
        icon="pi pi-file"
        label="uploaded Results"
        :value="data.results"
        bg-color="bg-amber-500"
        text-color="text-amber-500"
      />

      <VCard class="md:col-span-2 flex items-center">
        <div
          class="w-24 h-24 rounded-xl grid place-content-center text-white bg-[--p-primary-color]"
        >
          <span class="pi pi-users" style="font-size: 2.5rem"></span>
        </div>
        <Divider layout="vertical" />
        <div>
          <div>
            <h1 class="font-semibold">Class:</h1>
            <h1 class="text-xl font-bold">{{ data.staff.studentClass.className }}</h1>
          </div>
          <div>
            <h1 class="font-semibold">Students:</h1>
            <h1 class="text-xl font-bold">{{ data.students }}</h1>
          </div>
        </div>
      </VCard>

      <VCard class="md:col-span-2 flex items-center">
        <div>
          <CalendarIcon />
        </div>
        <Divider layout="vertical" />
        <div>
          <h1 class="font-semibold">Session</h1>
          <h1 class="text-xl font-bold">{{ data.currentSession.name }}</h1>
        </div>
      </VCard>

      <VCard class="md:col-span-2 flex items-center">
        <div>
          <img
            v-if="data.currentSemester.name === 'RAIN'"
            src="../../assets/img/rain.svg"
            alt="rain"
            class="h-24"
          />
          <img v-else src="../../assets/img/harmattan.svg" alt="harmattan" class="h-24" />
        </div>
        <Divider layout="vertical" />
        <div>
          <h1 class="font-semibold">Semester</h1>
          <h1 class="text-xl font-bold">{{ data.currentSemester.name }}</h1>
        </div>
      </VCard>
    </section>

    <VCard class="mt-2">
      <h1 class="font-bold">Your Top 10 Students: {{ data.topStudents.length }}</h1>
      <Divider />
      <div class="w-full overflow-auto">
        <DataTable
          :value="data.topStudents"
          size="small"
          dataKey="student"
          tableStyle="min-width: 0"
        >
          <Column field="image" style="min-width: 5rem">
            <template #body="slotProps">
              <div class="w-12 h-12 overflow-hidden rounded-full">
                <VAvatar :image="slotProps.data.image" rounded />
              </div>
            </template>
          </Column>

          <Column field="name" header="Name"> </Column>

          <Column field="regNumber" header="Reg. Number"></Column>

          <Column field="CGPA" header="CGPA">
            <template #body="slotProps">
              {{ formatGPA(slotProps.data.CGPA) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </VCard>

    <VCard class="mt-2">
      <h1 class="font-bold">Your Courses: {{ data.staff.courses.length }}</h1>
      <Divider />
      <div class="w-full overflow-auto">
        <DataTable
          :value="data.staff.courses"
          size="small"
          dataKey="_id"
          scrollable
          tableStyle="min-width: 0"
        >
          <Column field="code" header="Code" style="min-width: 6rem"> </Column>

          <Column field="title" header="Title" style="width: 25%; min-width: 20rem"> </Column>

          <Column field="unit" header="Units" style="min-width: 4rem"></Column>

          <Column field="isElective" header="Type">
            <template #body="{ data }">
              {{ data.isElective ? 'ELECTIVE' : 'COMPULSORY' }}
            </template>
          </Column>

          <Column>
            <template #body="slotProps">
              <div class="flex items-center gap-4">
                <Button
                  @click="addResult(slotProps.data)"
                  label="Result"
                  size="small"
                  icon="pi pi-file"
                  rounded
                />

                <Button
                  @click="viewDetails(slotProps.data)"
                  label="Details"
                  size="small"
                  icon="pi pi-book"
                  outlined
                  rounded
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
      <Drawer
        v-model:visible="visible"
        position="right"
        header="Course Details"
        style="width: 22rem"
      >
        <CourseDetails v-if="course" :course />
      </Drawer>
    </VCard>
  </main>
</template>
