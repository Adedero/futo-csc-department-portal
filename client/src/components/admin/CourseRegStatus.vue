<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  courseRegStatus: { type: Array, required: true },
  sessions: { type: Array, required: true },
  currentSession: { type: Object, required: true },
  currentSemester: { type: Object, required: true }
})

const emit = defineEmits(['update-course-reg'])

const router = useRouter()
const toast = useToast()

const editingRows = ref([])

const courseRegInfo = ref([...props.courseRegStatus])
const sessionNames = computed(() => props.sessions.map((session) => session.name))

const loading = ref(false)
const onRowEditSave = async (event) => {
  const updates = event.newData
  loading.value = true
  await usePost(
    '/api/admin/update-course-registration',
    { method: 'PUT', body: updates, router, toast, toastOnSuccess: true, toastLife: 3000 },
    () => {
      courseRegInfo.value = [updates]
      emit('update-course-reg', updates)
    }
  )
  loading.value = false
}


</script>

<template>
  <div class="grid gap-2">
    <div>
      <h1 class="text-[--p-primary-color] font-semibold">Course Registration</h1>
    </div>

    <div class="overflow-auto w-full">
      <DataTable
        :loading="loading"
        :value="courseRegInfo"
        tableStyle="min-width: 24"
        v-model:editingRows="editingRows"
        editMode="row"
        dataKey="id"
        @row-edit-save="onRowEditSave"
      >
        <Column field="isOpen" header="Status">
          <template #body="slotProps">
            <p :class="['font-medium', slotProps.data.isOpen ? 'text-green-500' : 'text-red-500']">
              {{ slotProps.data.isOpen ? 'Open' : 'Closed' }}
            </p>
          </template>
          <template #editor="{ data, field }">
            <ToggleButton v-model="data[field]" on-label="Open" off-label="Closed" class="w-full" />
          </template>
        </Column>

        <Column field="openSessions" header="Open Sessions">
          <template #body="slotProps">
            <ul v-if="slotProps.data.openSessions.length" class="list-disc ml-2">
              <li v-for="session in slotProps.data.openSessions" :key="session">
                {{ session }}
                <sup v-show="session === currentSession.name" class="text-red-500 font-medium"
                  >current</sup
                >
              </li>
            </ul>
            <p v-else>None</p>
          </template>
          <template #editor="{ data, field }">
            <InputGroup>
              <MultiSelect
                v-model="data[field]"
                :options="sessionNames"
                display="chip"
                class="max-w-48"
              />
            </InputGroup>
            <div>
              <ul class="text-sm font-medium list-disc ml-5">
                <li v-for="session in data[field]" :key="session">
                  {{ session }}
                  <sup v-show="session === currentSession.name" class="text-red-500 font-medium"
                    >current</sup
                  >
                </li>
              </ul>
            </div>
          </template>
        </Column>

        <Column field="openSemesters" header="Open Sesmesters">
          <template #body="slotProps">
            <ul v-if="slotProps.data.openSemesters.length" class="list-disc ml-2">
              <li v-for="semester in slotProps.data.openSemesters" :key="semester">
                {{ semester }}
                <sup v-show="semester === currentSemester.name" class="text-red-500 font-medium"
                  >current</sup
                >
              </li>
            </ul>
            <p v-else>None</p>
          </template>
          <template #editor="{ data, field }">
            <InputGroup>
              <MultiSelect
                v-model="data[field]"
                :options="['HARMATTAN', 'RAIN']"
                display="chip"
                class="max-w-48"
              />
            </InputGroup>
            <div>
              <ul class="text-sm font-medium list-disc ml-5">
                <li v-for="semester in data[field]" :key="semester">
                  {{ semester }}
                  <sup v-show="semester === currentSemester.name" class="text-red-500 font-medium"
                    >current</sup
                  >
                </li>
              </ul>
            </div>
          </template>
        </Column>

        <Column field="openLevels" header="Open Levels">
          <template #body="slotProps">
            <ul v-if="slotProps.data.openLevels.length" class="list-disc ml-2">
              <li v-for="level in slotProps.data.openLevels" :key="level">
                {{ level }}
              </li>
            </ul>
            <p v-else>None</p>
          </template>
          <template #editor="{ data, field }">
            <InputGroup>
              <MultiSelect
                v-model="data[field]"
                :options="[100, 200, 300, 400, 500]"
                display="chip"
                class="max-w-48"
              />
            </InputGroup>
            <div>
              <ul class="text-sm font-medium list-disc ml-5">
                <li v-for="level in data[field]" :key="level">
                  {{ level }}
                </li>
              </ul>
            </div>
          </template>
        </Column>

        <Column
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center"
        ></Column>
      </DataTable>

      <!-- <Message class="mt-5" icon="pi pi-info-circle">
        <p class="text-sm">Note: By default, a student's current level will always be open for registration</p>
      </Message> -->
    </div>
  </div>
</template>
