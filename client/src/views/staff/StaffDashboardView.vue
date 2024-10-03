<script setup>
import { ref } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const visible = ref(false)
const course = ref({})

const { data } = await useGet('/api/staff/dashboard-info', { router, toast })

const viewDetails = (data) => {
  course.value = { ...data }
  visible.value = true
}

const addResult = (course) => {
  router.push({
    name: 'staff-add-result',
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

    <section class="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-6">
      <VCard class="lg:col-span-4 flex items-center gap-2">
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
        class="lg:col-span-2"
        icon="pi pi-file"
        label="Uploaded results"
        :value="data.results"
        bg-color="bg-amber-500"
        text-color="text-amber-500"
      />

      <VCard class="lg:col-span-3 flex items-center">
        <div>
          <CalendarIcon />
        </div>
        <Divider layout="vertical" />
        <div>
          <h1 class="text-lg font-semibold">Session</h1>
          <h1 class="text-2xl font-bold">{{ data.currentSession.name }}</h1>
        </div>
      </VCard>

      <VCard class="lg:col-span-3 flex items-center">
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
          <h1 class="text-lg font-semibold">Semester</h1>
          <h1 class="text-2xl font-bold">{{ data.currentSemester.name }}</h1>
        </div>
      </VCard>
    </section>

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
