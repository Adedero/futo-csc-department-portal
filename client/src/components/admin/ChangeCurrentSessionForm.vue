<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  sessions: { type: Array, required: true },
  currentSession: { type: Object, required: true }
})

const emit = defineEmits(['update-current-session'])

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const selectedSession = ref({})

const changeCurrentSession = async () => {
  if (!selectedSession.value.name) return
  if (selectedSession.value.name === props.currentSession.name) {
    selectedSession.value = {}
    return
  }
  loading.value = true
  await usePost(
    '/api/admin/change-current-session',
    {
      method: 'PUT',
      body: selectedSession.value,
      router,
      toast,
      toastOnSuccess: true,
      toastLife: 3000
    },
    () => {
      emit('update-current-session', selectedSession.value)
      selectedSession.value = {}
    }
  )
  loading.value = false
}
</script>

<template>
  <div class="grid gap-2 md:grid-cols-3">
    <div class="md:col-span-3">
      <h1 class="text-[--p-primary-color] font-semibold">Change Current Session</h1>
      <small
        >Student class levels will be automatically calculated based on the session name.</small
      >
    </div>
    <div class="grid gap-1">
      <p class="text-sm font-semibold">Current Session</p>
      <InputText :value="currentSession.name" readonly />
    </div>

    <div class="grid gap-1">
      <p class="text-sm font-semibold">Change Current Session</p>
      <InputGroup>
        <Select
          v-model="selectedSession"
          :options="sessions"
          option-label="name"
          placeholder="Choose session"
        />
        <Button
          @click="changeCurrentSession"
          icon="pi pi-check"
          :loading
          :disabled="loading || !selectedSession.name"
        />
      </InputGroup>
    </div>
  </div>
</template>
