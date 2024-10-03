<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'
import upload from '@/composables/server/file-upload'
import { useConfirm } from 'primevue/useconfirm'

const props = defineProps({
  student: { type: Object, required: true }
})

const emit = defineEmits(['image-change', 'name-change'])

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const isEditing = ref(false)

const studentRef = ref({
  name: props.student.name,
  regNumber: props.student.regNumber
})

const cancelEdit = () => {
  studentRef.value = {
    name: props.student.name,
    regNumber: props.student.regNumber
  }
  isEditing.value = false
}

const imageUrl = ref('')

const handleSelect = (data) => {
  const file = data[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const imageLoading = ref(false)

const uploadImage = async (files) => {
  const file = files[0]
  imageLoading.value = true
  const { data } = await upload.image(file, props.student._id, {
    uploader: 'admin',
    model: 'student',
    router,
    toast
  })
  imageLoading.value = false
  emit('image-change', data.value.url)
  isEditing.value = false
}

const changeLoading = ref(false)
const changeNameAndRegNumber = async () => {
  if (!studentRef.value.name || !studentRef.value.regNumber) {
    isEditing.value = false
    return
  }
  if (
    studentRef.value.name === props.student.name &&
    studentRef.value.regNumber === props.student.regNumber
  ) {
    isEditing.value = false
    return
  }
  changeLoading.value = true
  await usePost(
    `/api/admin/change-name-or-reg-number/${props.student.userId}/${props.student._id}`,
    {
      body: studentRef.value,
      router,
      toast,
      method: 'PUT',
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    (data) => {
      isEditing.value = false
      emit('name-change', data)
    }
  )
  changeLoading.value = false
}

const resetLoading = ref(false)
const resetLogin = async () => {
  resetLoading.value = true
  await usePost(
    `/api/admin/reset-login/${props.student.userId}/student`,
    {
      router,
      toast,
      method: 'PUT',
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    () => (isEditing.value = false)
  )
  resetLoading.value = false
}

const confirmReset = () => {
  confirm.require({
    message: `Student's username and password will be reset to their registration number. Proceed?`,
    header: `Reset Login`,
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Proceed',
      severity: 'danger'
    },
    accept: () => {
      resetLogin()
    }
  })
}
</script>

<template>
  <div>
    <ConfirmDialog class="max-w-96"></ConfirmDialog>

    <div v-if="!isEditing" class="text-center flex flex-col gap-5 items-center">
      <div class="w-28 md:w-32 aspect-square rounded-full">
        <VAvatar :image="student.image" rounded fluid />
      </div>
      <div>
        <h1 class="font-semibold text-lg">{{ student.name }}</h1>
        <p class="font-medium">{{ student.regNumber }}</p>
        <p class="text-sm">{{ student.level }} Level</p>
        <Divider />
        <Button @click="isEditing = true" icon="pi pi-user-edit" />
      </div>
    </div>

    <div v-else class="grid">
      <Button @click="cancelEdit" icon="pi pi-check" severity="success" class="ml-auto" rounded />

      <div class="flex flex-col items-center gap-3">
        <div class="w-28 md:w-32 aspect-square rounded-full">
          <VAvatar v-if="!imageUrl" :image="student.image" rounded fluid />
          <VAvatar v-else :image="imageUrl" rounded fluid />
        </div>
        <FileUploader
          :loading="imageLoading"
          @select="handleSelect"
          @upload="uploadImage"
          accept=".jpg,.jpeg,.png"
          :maxFileSize="1024 * 300"
          invalidFileSizeMessage="Image must be 300KB or less"
          invalidFileTypeMessage="Image can only be .jpg, .jpeg, or .png"
          class="w-full"
        />
      </div>

      <Divider />

      <div class="grid gap-[0.6rem]">
        <div class="grid gap-1">
          <label for="name" class="text-sm font-medium">Name</label>
          <InputText v-model="studentRef.name" type="text" id="name" fluid />
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Reg. Number</label>
          <InputMask v-model="studentRef.regNumber" mask="99999999999" fluid />
        </div>

        <Button
          @click="changeNameAndRegNumber"
          :loading="changeLoading"
          label="Save"
          icon="pi pi-check"
        />
      </div>

      <Divider />

      <div>
        <Button
          @click="confirmReset"
          :loading="resetLoading"
          label="Reset Login"
          severity="danger"
          icon="pi pi-lock"
          fluid
          outlined
        />
      </div>
    </div>
  </div>
</template>
