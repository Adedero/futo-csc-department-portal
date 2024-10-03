<script setup>
import { ref } from 'vue'
import { validateSessionName } from '@/composables/utils/validate'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const router = useRouter()
const toast = useToast()

const session = ref({})

const cancelCreateSession = () => {
  session.value = {}
}

const loading = ref(false)
const createSession = async () => {
  const isValid = validateSessionName(session.value.name)
  if (!isValid) {
    toast.open({
      type: 'warning',
      message: 'Invalid session name',
      duration: 5000,
      position: 'top-right'
    })
    return
  }
  await usePost(
    '/api/admin/new-session',
    { body: session.value, router, toast, toastOnSuccess: true, toastLife: 3000 },
    () => {
      session.value = {}
    }
  )
  loading.value = false
}
</script>

<template>
  <div class="grid gap-2 md:grid-cols-3">
    <div class="md:col-span-3">
      <h1 class="text-[--p-primary-color] font-semibold">New Session</h1>
    </div>
    <div class="grid gap-1">
      <label class="text-sm font-medium"
        >Session name <small class="text-red-500">Required</small></label
      >
      <InputMask v-model="session.name" mask="9999-9999" placeholder="E.g. 2022-2023" />
    </div>

    <div class="grid gap-1">
      <label class="text-sm font-medium">Start Date</label>
      <DatePicker
        v-model="session.startsAt"
        date-format="dd/mm/yy"
        showButtonBar
        placeholder="Start date"
      />
    </div>

    <div class="grid gap-1">
      <label class="text-sm font-medium">End Date</label>
      <DatePicker
        v-model="session.endsAt"
        date-format="dd/mm/yy"
        showButtonBar
        placeholder="End date"
      />
    </div>

    <div v-show="session.name" class="md:col-span3 flex items-center gap-2">
      <Button @click="createSession" :loading label="Create" icon="pi pi-check" />
      <Button @click="cancelCreateSession" label="Cancel" icon="pi pi-times" severity="secondary" />
    </div>
  </div>
</template>
