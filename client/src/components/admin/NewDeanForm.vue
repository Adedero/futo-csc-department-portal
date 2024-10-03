<script setup>
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  header: { type: String },
  create: { type: String, default: 'true' },
  deanId: { type: String }
})
const emit = defineEmits(['add-dean'])

const router = useRouter()
const toast = useToast()

const visible = ref(false)

const loading = ref(false)

const dean = ref({
  role: 'DEAN',
  email: null,
  phoneNumber: null
})

const addDean = async () => {
  if (
    !dean.value.name ||
    !dean.value.title ||
    !dean.value.staffId ||
    !dean.value.username ||
    !dean.value.password
  )
    return

  if (dean.value.username.length < 6) {
    toast.error('Username must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (dean.value.password.length < 6) {
    toast.error('Password must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (!dean.value.email) delete dean.value.email
  if (!dean.value.phoneNumber) delete dean.value.phoneNumber

  loading.value = true

  await usePost(
    `/api/admin/add-dean?create=${props.create}&deanId=${props.deanId}`,
    { body: dean.value, router, toast },
    (data) => {
      emit('add-dean', data)
      dean.value = { role: 'DEAN', email: null, phoneNumber: null }
      visible.value = false
    }
  )
  loading.value = false
}

watchEffect(() => {
  ;(dean.value.username = dean.value.staffId), (dean.value.password = dean.value.staffId)
})

const open = () => (visible.value = true)
</script>

<template>
  <div>
    <slot name="addButton" :open></slot>
    <Dialog v-model:visible="visible" modal header="New Dean" class="z-10 max-w-96">
      <FormContainer optional>
        <template #requiredFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label class="text-sm font-medium block">Name</label>
              <InputText v-model.trim="dean.name" class="w-full" placeholder="Full name" />
            </div>

            <div class="w-full">
              <label for="dean-title" class="text-sm font-medium block">Title</label>
              <InputText
                v-model.trim="dean.title"
                class="w-full"
                placeholder="Title e.g Mr., Dr."
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Staff ID</label>
              <InputMask
                v-model="dean.staffId"
                mask="9999aa"
                class="w-full"
                placeholder="Staff ID"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Username</label>
              <InputText v-model.trim="dean.username" class="w-full" placeholder="Username" />
              <small>Defaults to staff ID</small>
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Password</label>
              <Password
                v-model.trim="dean.password"
                toggle-mask
                :feedback="false"
                input-class="w-full"
                class="w-full"
                placeholder="Password"
              />
              <small>Defaults to staff ID</small>
            </div>
          </div>
        </template>

        <template #optionalFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label class="text-sm font-medium block">Email</label>
              <InputText v-model.trim="dean.email" class="w-full" placeholder="Email address" />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Phone</label>
              <InputMask
                v-model.trim="dean.phoneNumber"
                mask="99999999999"
                class="w-full"
                placeholder="Phone number"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Sex</label>
              <Select
                v-model.trim="dean.sex"
                :options="['MALE', 'FEMALE', 'OTHER']"
                class="w-full"
                placeholder="Sex"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Home address</label>
              <Textarea
                v-model.trim="dean.address"
                class="w-full"
                autoResize
                rows="1"
                cols="30"
                placeholder="Home address"
              />
            </div>
          </div>
        </template>
      </FormContainer>
      <Button @click="addDean" label="Add" icon="pi pi-user-plus" :loading class="mt-2 w-full" />
    </Dialog>
  </div>
</template>
