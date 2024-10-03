<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const page = ref(0)
const limit = ref(20)
const skip = computed(() => page.value * limit.value)

const students = ref([])
const numberOfStudents = ref(0)
const loading = ref(false)

const getStudents = async () => {
  if (loading.value) return
  loading.value = true
  await useGet(
    `/api/admin/students?skip=${skip.value}&limit=${limit.value}`,
    { router, toast },
    (data) => {
      students.value = [...data.students]
      numberOfStudents.value = data.numberOfStudents
    }
  )
  loading.value = false
}

const totalPages = computed(() => Math.ceil(numberOfStudents.value / limit.value))

const lowerBound = computed(() => page.value * limit.value + 1)
const upperBound = computed(() => Math.min((page.value + 1) * limit.value, numberOfStudents.value))

watch(page, () => getStudents())

onMounted(async () => getStudents())
</script>

<template>
  <main class="w-full p-2 overflow-y-auto">
    <VCard>
      <div class="flex items-center justify-between gap-2">
        <h1 class="font-bold text-xl">Students</h1>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <Button
              @click="page--"
              text
              severity="secondary"
              size="small"
              icon="pi pi-chevron-left"
              :disabled="page < 1"
            />
            <p class="text-sm">{{ lowerBound }} - {{ upperBound }} of {{ numberOfStudents }}</p>
            <Button
              @click="page++"
              text
              severity="secondary"
              size="small"
              icon="pi pi-chevron-right"
              :disabled="page + 1 === totalPages"
            />
          </div>
          <NewStudentForm @add-student="(student) => students.push(student)">
            <template #addButton="{ open }">
              <Button @click="open" label="Add" icon="pi pi-user-plus" />
            </template>
          </NewStudentForm>
        </div>
      </div>

      <div class="mt-2 flex items-center justify-between gap-2">
        <SearchWithSidebar model="student" placeholder="Search name or reg. number">
          <template #results="{ value, results }">
            <p class="text-sm mb-3">
              Search for <span class="font-medium">{{ value }}</span>
            </p>
            <div class="flex flex-col gap-4">
              <RouterLink
                :to="`/admin/student/${result._id}`"
                v-for="result in results"
                :key="result._id"
                class="flex items-center gap-2 flex-shrink-0 border-b pb-2"
              >
                <div class="w-10 aspect-square rounded-full">
                  <VAvatar :image="result.userDetails.image" fuild rounded />
                </div>
                <div>
                  <p class="font-semibold">{{ result.userDetails.name }}</p>
                  <p class="text-sm">{{ result.regNumber }}</p>
                </div>
              </RouterLink>
            </div>
          </template>
        </SearchWithSidebar>
      </div>
    </VCard>

    <VCard class="pt-0 mt-2 h-[calc(100dvh-13.5rem)] overflow-y-scroll">
      <div v-if="loading" class="grid gap-2 pt-3">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3">
          <Skeleton shape="circle" height="3rem" width="3rem" class="flex-shrink-0" />
          <Skeleton height="1.2rem" width="50%" />
          <Skeleton height="1.2rem" width="20%" class="ml-auto" />
          <Skeleton height="1.2rem" width="3rem" class="ml-5" />
        </div>
      </div>
      <table v-else class="table table-sm">
        <thead>
          <th>S/N</th>
          <th></th>
          <th>Name</th>
          <th>Reg. Number</th>
          <th>Level</th>
        </thead>

        <tbody>
          <tr
            v-for="(student, index) in students"
            :key="student._id"
            @click="$router.push(`/admin/student/${student._id}`)"
            class="cursor-pointer"
          >
            <td class="w-1">{{ page * limit + index + 1 }}</td>
            <td class="w-fit">
              <VAvatar :image="student.user.image" class="w-10" rounded />
            </td>
            <td>{{ student.user.name }}</td>
            <td>{{ student.regNumber }}</td>
            <td>{{ student.studentClass.currentLevel }}</td>
          </tr>
        </tbody>
      </table>
    </VCard>
  </main>
</template>
