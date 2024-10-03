<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { usePost } from '@/composables/server/use-fetch'
import upload from '@/composables/server/file-upload'
import { useConfirm } from 'primevue/useconfirm'
import { staffRanks } from '@/data/school-data'

const props = defineProps({
  staff: { type: Object, required: true }
})

const emit = defineEmits(['image-change', 'details-change'])

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const isEditing = ref(false)

const staffRef = ref({
  name: props.staff.user.name,
  staffId: props.staff.staffId,
  isActive: props.staff.isActive,
  rank: props.staff.rank,
  title: props.staff.user.title
})

const cancelEdit = () => {
  staffRef.value = {
    name: props.staff.user.name,
    staffId: props.staff.staffId,
    rank: props.staff.rank,
    isActive: props.staff.isActive,
    title: props.staff.user.title
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
  const { data } = await upload.image(file, props.staff._id, {
    uploader: 'admin',
    model: 'staff',
    router,
    toast
  })
  imageLoading.value = false
  emit('image-change', data.value.url)
  isEditing.value = false
}

const changeLoading = ref(false)
const changeStaffDetails = async () => {
  if (!staffRef.value.name || !staffRef.value.staffId) {
    isEditing.value = false
    return
  }
  if (
    staffRef.value.name === props.staff.user.name &&
    staffRef.value.staffId === props.staff.staffId &&
    staffRef.value.rank === props.staff.rank &&
    staffRef.value.title === props.staff.user.title &&
    staffRef.value.isActive === props.staff.isActive
  ) {
    isEditing.value = false
    return
  }
  changeLoading.value = true
  await usePost(
    `/api/admin/change-staff-details/${props.staff.user._id}/${props.staff._id}`,
    {
      body: staffRef.value,
      router,
      toast,
      method: 'PUT',
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    (data) => {
      isEditing.value = false
      emit('details-change', data)
    }
  )
  changeLoading.value = false
}

const resetLoading = ref(false)
const resetLogin = async () => {
  resetLoading.value = true
  await usePost(
    `/api/admin/reset-login/${props.staff.user._id}/staff`,
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
    message: `Staff's username and password will be reset to their staff ID. Proceed?`,
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

    <div v-show="!isEditing" class="text-center flex flex-col gap-5 items-center">
      <div class="w-28 md:w-32 aspect-square rounded-full">
        <VAvatar :image="staff.user.image" rounded fluid />
      </div>
      <div>
        <h1 class="font-semibold text-lg">{{ staff.user.title }}</h1>
        <h1 class="font-semibold text-lg">
          {{ staff.user.name }} <sup v-show="staff.isHOD" class="text-red-500">HOD</sup>
        </h1>
        <p class="font-medium">{{ staff.staffId }}</p>
        <p class="text-sm">{{ staff.isActive ? 'CURRENT STAFF' : 'FORMER STAFF' }}</p>
        <Divider />
        <div v-if="staff.isAdvisor" class="grid gap-1 text-sm text-center">
          <p>
            Advisor Status:
            <span class="font-semibold">{{ staff.isAdvisor ? 'Advisor' : 'Not and Advisor' }}</span>
          </p>
          <p>
            Class: <span class="font-semibold">{{ staff.studentClass.className }}</span>
          </p>
          <p>
            Level: <span class="font-semibold">{{ staff.studentClass.currentLevel }}</span>
          </p>
          <Divider />
        </div>

        <Button @click="isEditing = true" icon="pi pi-user-edit" />
      </div>
    </div>

    <div v-if="isEditing" class="grid">
      <Button @click="cancelEdit" icon="pi pi-check" severity="success" class="ml-auto" rounded />

      <div class="flex flex-col items-center gap-3">
        <div class="w-28 md:w-32 aspect-square rounded-full">
          <VAvatar v-if="!imageUrl" :image="staff.user.image" rounded fluid />
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
          <label for="title" class="text-sm font-medium">Title</label>
          <InputText v-model="staffRef.title" type="text" id="title" fluid />
        </div>

        <div class="grid gap-1">
          <label for="name" class="text-sm font-medium">Name</label>
          <InputText v-model="staffRef.name" type="text" id="name" fluid />
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Staff ID</label>
          <InputMask v-model="staffRef.staffId" mask="9999aa" fluid />
        </div>

        <div class="grid gap-1">
          <label class="text-sm font-medium">Rank</label>
          <Select v-model="staffRef.rank" :options="staffRanks" fluid />
        </div>

        <div class="grid place-content-center">
          <p class="text-sm">
            Active status:
            <span class="font-semibold">
              {{ staffRef.isActive ? 'Current Staff' : 'Former Staff' }}</span
            >
          </p>
          <ToggleSwitch v-model="staffRef.isActive" class="mx-auto" />
        </div>

        <Button
          @click="changeStaffDetails"
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
