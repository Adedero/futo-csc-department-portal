<script setup>
import { ref, watchEffect } from 'vue'
import { qualifications, staffRanks } from '@/data/school-data'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  header: { type: String },
  model: { type: String, default: 'admin' }
})
const emit = defineEmits(['add-staff'])

const router = useRouter()
const toast = useToast()

const visible = ref(false)

const loading = ref(false)

const staff = ref({
  role: 'STAFF',
  isAdvisor: false,
  isHOD: false,
  email: null,
  phoneNumber: null,
  isActive: true
})

const addStaff = async () => {
  if (
    !staff.value.name ||
    !staff.value.title ||
    !staff.value.staffId ||
    !staff.value.rank ||
    !staff.value.username ||
    !staff.value.password
  )
    return

  if (staff.value.username.length < 6) {
    toast.error('Username must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (staff.value.password.length < 6) {
    toast.error('Password must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (!staff.value.email) delete staff.value.email
  if (!staff.value.phoneNumber) delete staff.value.phoneNumber

  if (staff.value.specialization) {
    const specsArray = staff.value.specialization.split(',')
    staff.value.specialization = specsArray.map((spec) => spec.trim())
  }

  loading.value = true

  await usePost(`/api/${props.model}/add-staff`, { body: staff.value, router, toast }, (data) => {
    emit('add-staff', data)
    staff.value = { role: 'STAFF', isAdvisor: false, isHOD: false, email: null, phoneNumber: null }
    visible.value = false
  })
  loading.value = false
}

watchEffect(() => {
  ;(staff.value.username = staff.value.staffId), (staff.value.password = staff.value.staffId)
})

const open = () => (visible.value = true)
</script>

<template>
  <div>
    <slot name="addButton" :open></slot>
    <Dialog v-model:visible="visible" modal header="New Staff" class="z-10 max-w-96">
      <FormContainer optional>
        <template #requiredFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label for="full-name" class="text-sm font-medium block">Name</label>
              <InputText
                v-model.trim="staff.name"
                id="full-name"
                class="w-full"
                placeholder="Full name"
              />
            </div>

            <div class="w-full">
              <label for="staff-title" class="text-sm font-medium block">Title</label>
              <InputText
                v-model.trim="staff.title"
                id="staff-title"
                class="w-full"
                placeholder="Title e.g Mr., Dr."
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Staff ID</label>
              <InputMask
                v-model="staff.staffId"
                mask="9999aa"
                class="w-full"
                placeholder="Staff ID"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Rank</label>
              <Select
                v-model="staff.rank"
                :options="staffRanks"
                class="w-full"
                placeholder="Rank"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Username</label>
              <InputText v-model.trim="staff.username" class="w-full" placeholder="Username" />
              <small>Defaults to staff ID</small>
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Password</label>
              <Password
                v-model.trim="staff.password"
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
              <label class="text-sm font-medium block">Qualification</label>
              <MultiSelect
                v-model="staff.qualification"
                display="chip"
                :options="qualifications"
                filter
                placeholder="Qualification"
                class="w-full"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Specialization</label>
              <Textarea
                v-model="staff.specialization"
                rows="2"
                auto-resize
                placeholder="Areas of specialization"
                class="w-full"
              />
              <small
                >Separate multiple areas with a comma "," e.g "AI, Robotics, Data Science..."</small
              >
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Nationality</label>
              <InputText
                v-model.trim="staff.nationality"
                class="w-full"
                placeholder="Nationality"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">State of origin</label>
              <InputText
                v-model.trim="staff.stateOfOrigin"
                class="w-full"
                placeholder="State of origin"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Date of birth</label>
              <DatePicker
                v-model.trim="staff.dateOfBirth"
                dateFormat="dd/mm/yy"
                class="w-full"
                placeholder="Date of birth"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Email</label>
              <InputText v-model.trim="staff.email" class="w-full" placeholder="Email address" />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Phone</label>
              <InputMask
                v-model.trim="staff.phoneNumber"
                mask="99999999999"
                class="w-full"
                placeholder="Phone number"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Sex</label>
              <Select
                v-model.trim="staff.sex"
                :options="['MALE', 'FEMALE', 'OTHER']"
                class="w-full"
                placeholder="Sex"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Home address</label>
              <Textarea
                v-model.trim="staff.address"
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
      <Button @click="addStaff" label="Add" icon="pi pi-user-plus" :loading class="mt-2 w-full" />
    </Dialog>
  </div>
</template>
