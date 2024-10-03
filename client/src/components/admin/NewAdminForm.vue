<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

defineProps({
  header: { type: String }
})
const emit = defineEmits(['add-admin'])

const router = useRouter()
const toast = useToast()

const visible = ref(false)

const loading = ref(false)

const admin = ref({
  role: 'ADMIN',
  email: null,
  phoneNumber: null
})

const addAdmin = async () => {
  if (!admin.value.name || !admin.value.username || !admin.value.password || !admin.value.role)
    return

  if (admin.value.username.length < 6) {
    toast.error('Username must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (admin.value.password.length < 6) {
    toast.error('Password must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (!admin.value.email) delete admin.value.email
  if (!admin.value.phoneNumber) delete admin.value.phoneNumber

  loading.value = true

  await usePost('/api/admin/add-admin', { body: admin.value, router, toast }, (data) => {
    emit('add-admin', data)
    admin.value = data
    visible.value = false
  })
  loading.value = false
}
const open = () => (visible.value = true)
</script>

<template>
  <div>
    <slot name="addButton" :open></slot>
    <Dialog v-model:visible="visible" modal header="New Admin" class="z-10 max-w-96">
      <FormContainer optional>
        <template #requiredFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label class="text-sm font-medium block">Name</label>
              <InputText v-model.trim="admin.name" class="w-full" placeholder="Full name" />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Username</label>
              <InputText v-model.trim="admin.username" class="w-full" placeholder="Username" />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Password</label>
              <Password
                v-model.trim="admin.password"
                toggle-mask
                input-class="w-full"
                class="w-full"
                placeholder="Password"
              />
            </div>
          </div>
        </template>

        <template #optionalFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label class="text-sm font-medium block">Title</label>
              <InputText
                v-model.trim="admin.title"
                class="w-full"
                placeholder="Title e.g Mr., Dr."
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Email</label>
              <InputText v-model.trim="admin.email" class="w-full" placeholder="Email address" />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Phone</label>
              <InputMask
                v-model.trim="admin.phoneNumber"
                mask="99999999999"
                class="w-full"
                placeholder="Phone number"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Sex</label>
              <Select
                v-model.trim="admin.sex"
                :options="['MALE', 'FEMALE', 'OTHER']"
                class="w-full"
                placeholder="Sex"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Home address</label>
              <Textarea
                v-model.trim="admin.address"
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
      <Button @click="addAdmin" label="Add" icon="pi pi-user-plus" :loading class="mt-2 w-full" />
    </Dialog>
  </div>
</template>
