<script setup>
import { ref, watchEffect } from 'vue'
import { entryModes } from '@/data/school-data'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'

const props = defineProps({
  header: { type: String },
  studentClass: { type: String, default: '' }
})
const emit = defineEmits(['add-student'])

const router = useRouter()
const toast = useToast()

const visible = ref(false)

const loading = ref(false)

const student = ref({
  role: 'STUDENT',
  email: null,
  phoneNumber: null
})

const addStudent = async () => {
  if (props.studentClass && props.studentClass.length) {
    student.value.className = props.studentClass
  }

  if (
    !student.value.name ||
    !student.value.className ||
    !student.value.username ||
    !student.value.password ||
    !student.value.regNumber ||
    !student.value.entryMode
  )
    return

  if (student.value.username.length < 6) {
    toast.error('Username must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (student.value.password.length < 6) {
    toast.error('Password must be at least 6 characters long', { position: 'top-right' })
    return
  }

  if (!student.value.email) delete student.value.email
  if (!student.value.phoneNumber) delete student.value.phoneNumber

  const isClassNameValid = validateClassName(student.value.className)

  if (!isClassNameValid) {
    toast.open({
      type: 'warning',
      message: 'Invalid class name',
      duration: 5000,
      position: 'top-right'
    })
    return
  }
  loading.value = true

  await usePost('/api/admin/add-student', { body: student.value, router, toast }, (data) => {
    emit('add-student', data)
    student.value = { role: 'STUDENT', email: null, phoneNumber: null }
    visible.value = false
  })
  loading.value = false
}

watchEffect(() => {
  ;(student.value.username = student.value.regNumber),
    (student.value.password = student.value.regNumber)
})

const open = () => (visible.value = true)

function validateClassName(className) {
  const classNameArray = className.split('-')
  if (classNameArray.length !== 2) return false
  const start = parseInt(classNameArray[0])
  const end = parseInt(classNameArray[classNameArray.length - 1])

  if (end > start && end - start === 1) return true
  return false
}
</script>

<template>
  <div>
    <slot name="addButton" :open></slot>
    <Dialog v-model:visible="visible" modal header="New Student" class="z-10 max-w-96">
      <FormContainer optional>
        <template #requiredFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label for="full-name" class="text-sm font-medium block">Name</label>
              <InputText
                v-model.trim="student.name"
                id="full-name"
                class="w-full"
                placeholder="Full name"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Reg. Number</label>
              <InputMask
                v-model="student.regNumber"
                mask="99999999999"
                class="w-full"
                placeholder="Reg. number"
              />
            </div>

            <div v-if="studentClass" class="w-full">
              <label class="text-sm font-medium block">Student class</label>
              <InputText
                :value="studentClass"
                readonly
                class="w-full"
                placeholder="Class name e.g. 2023-2024"
              />
            </div>

            <div v-else class="w-full">
              <label class="text-sm font-medium block">Student class</label>
              <InputMask
                v-model="student.className"
                mask="9999-9999"
                class="w-full"
                placeholder="Class name e.g. 2023-2024"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Entry Mode</label>
              <Select
                v-model="student.entryMode"
                :options="entryModes"
                class="w-full"
                placeholder="Entry mode"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Username</label>
              <InputText v-model.trim="student.username" class="w-full" placeholder="Username" />
              <small>Defaults to student's reg. number</small>
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Password</label>
              <Password
                v-model.trim="student.password"
                toggle-mask
                :feedback="false"
                input-class="w-full"
                class="w-full"
                placeholder="Password"
              />
              <small>Defaults to student's reg. number</small>
            </div>
          </div>
        </template>

        <template #optionalFields>
          <div class="mt-2 grid gap-3">
            <div class="w-full">
              <label class="text-sm font-medium block">Nationality</label>
              <InputText
                v-model.trim="student.nationality"
                class="w-full"
                placeholder="Nationality"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">State of origin</label>
              <InputText
                v-model.trim="student.stateOfOrigin"
                class="w-full"
                placeholder="State of origin"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Date of birth</label>
              <DatePicker
                v-model.trim="student.dateOfBirth"
                dateFormat="dd/mm/yy"
                class="w-full"
                placeholder="Date of birth"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Email</label>
              <InputText v-model.trim="student.email" class="w-full" placeholder="Email address" />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Phone</label>
              <InputMask
                v-model.trim="student.phoneNumber"
                mask="99999999999"
                class="w-full"
                placeholder="Phone number"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Sex</label>
              <Select
                v-model.trim="student.sex"
                :options="['MALE', 'FEMALE', 'OTHER']"
                class="w-full"
                placeholder="Sex"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Home address</label>
              <Textarea
                v-model.trim="student.address"
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
      <Button @click="addStudent" label="Add" icon="pi pi-user-plus" :loading class="mt-2 w-full" />
    </Dialog>
  </div>
</template>
