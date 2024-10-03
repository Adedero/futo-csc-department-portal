<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  currentSemester: { type: Object, required: true }
})

const emit = defineEmits(['update-current-semester'])

const router = useRouter()
const toast = useToast()

const semesters = [
  { _id: 1, name: 'HARMATTAN' },
  { _id: 2, name: 'RAIN' }
]

const loading = ref(false)
const selectedSemester = ref({})

const changeCurrentSemester = async () => {
  if (!selectedSemester.value.name) return
  if (selectedSemester.value.name === props.currentSemester.name) {
    selectedSemester.value = {}
    return
  }
  loading.value = true
  await usePost(
    '/api/admin/change-current-semester',
    {
      method: 'PUT',
      body: selectedSemester.value,
      router,
      toast,
      toastOnSuccess: true,
      toastLife: 3000
    },
    () => {
      emit('update-current-semester', selectedSemester.value)
      selectedSemester.value = {}
    }
  )
  loading.value = false
}
</script>

<template>
  <div class="grid gap-2 md:grid-cols-3">
    <div class="md:col-span-3">
      <h1 class="text-[--p-primary-color] font-semibold">Change Current Semester</h1>
    </div>
    <div class="grid gap-1">
      <p class="text-sm font-semibold">Current Semester</p>
      <InputText :value="currentSemester.name" readonly />
    </div>

    <div class="grid gap-1">
      <p class="text-sm font-semibold">Change Current Semester</p>
      <InputGroup>
        <Select
          v-model="selectedSemester"
          :options="semesters"
          option-label="name"
          placeholder="Choose semester"
        />
        <Button
          @click="changeCurrentSemester"
          icon="pi pi-check"
          :loading
          :disabled="loading || !selectedSemester.name"
        />
      </InputGroup>
    </div>
  </div>
</template>
