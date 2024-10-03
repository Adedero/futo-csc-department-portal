<script setup>
import { ref } from 'vue'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import upload from '@/composables/server/file-upload'
import { useConfirm } from 'primevue/useconfirm'

const props = defineProps({
  hod: { type: Object, required: true }
})

const emit = defineEmits(['change-hod', 'image-change'])

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const staffs = ref([])
const selectedStaff = ref({})
const loadingStaffs = ref(false)

const isChangingHod = ref(false)
const changeHod = async () => {
  if (loadingStaffs.value) return
  if (isChangingHod.value) {
    isChangingHod.value = false
    return
  }
  isChangingHod.value = true
  loadingStaffs.value = true
  await useGet('/api/admin/all-staffs', { router, toast }, (data) => {
    staffs.value = data
  })
  loadingStaffs.value = false
}

const savingHod = ref(false)
const saveNewHod = async () => {
  if (loadingStaffs.value || savingHod.value) return
  let staffId = selectedStaff.value._id.toString()
  if (staffId === props.hod._id.toString()) {
    selectedStaff.value = {}
    isChangingHod.value = false
    return
  }
  await usePost(
    `/api/admin/change-hod`,
    {
      method: 'PUT',
      body: selectedStaff.value,
      router,
      toast,
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    (data) => {
      emit('change-hod', data)
      isChangingHod.value = false
      selectedStaff.value = {}
    }
  )
  savingHod.value = false
}

//Changing H.O.D image
const isChangingImage = ref(false)
const imageUrl = ref(props.hod.user.image)

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
  const { data } = await upload.image(file, props.hod._id, {
    uploader: 'admin',
    model: 'staff',
    router,
    toast
  })
  if (data.value.url) {
    imageLoading.value = false
    emit('image-change', data.value.url)
    isChangingImage.value = false
  }
}

const cancelImageChange = () => {
  isChangingImage.value = false
  imageUrl.value = props.hod.user.image
}

//Resetting login
const resetLoading = ref(false)
const resetLogin = async () => {
  resetLoading.value = true
  await usePost(`/api/admin/reset-login/${props.hod.user._id}/staff`, {
    router,
    toast,
    method: 'PUT',
    toastOnSuccess: true,
    successDetail: 'Done',
    toastLife: 3000
  })
  resetLoading.value = false
}

const confirmReset = () => {
  confirm.require({
    message: `The HOD's username and password will be reset to their staff ID. Proceed?`,
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
  <section
    class="mt-2 w-full overflow-y-auto grid content-start gap-3 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-10"
  >
    <ConfirmDialog class="max-w-96"></ConfirmDialog>

    <aside class="p-2 md:col-span-3 lg:col-span-3 xl:col-span-3">
      <div v-if="isChangingImage" class="flex flex-col items-center justify-center gap-3">
        <div class="flex flex-col items-center gap-3 w-full">
          <div class="w-28 md:w-32 aspect-square rounded-full">
            <VAvatar :image="imageUrl" rounded fluid />
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
        <Button
          @click="cancelImageChange"
          icon="pi pi-times"
          severity="danger"
          outlined
          class="mx-auto"
          rounded
        />
      </div>

      <div v-else class="flex flex-col items-center justify-center gap-3">
        <div class="w-28 md:w-32 aspect-square rounded-full">
          <VAvatar :image="imageUrl ? imageUrl : hod.user.image" rounded fluid />
        </div>

        <div class="text-center">
          <h1 class="text-lg font-semibold">{{ hod.user.title }}</h1>
          <h1 class="text-lg font-semibold">{{ hod.user.name }}</h1>
          <h1>HOD, CSC</h1>
        </div>

        <div class="flex items-center gap-2">
          <Button @click="isChangingImage = true" icon="pi pi-user-edit" rounded outlined />
          <Button
            @click="$router.push(`/admin/staff/${hod._id}`)"
            label="Profile"
            icon="pi pi-user"
            rounded
          />
        </div>
      </div>
    </aside>

    <div class="grid gap-3 md:col-span-7 lg:col-span-9 xl:col-span-7">
      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-user" style="font-size: 0.9rem"></span>
          <h1 class="font-semibold">H.O.D</h1>
        </div>
        <Divider />
        <div class="grid gap-3 md:grid-cols-2">
          <div class="grid gap-1">
            <label for="phone-number" class="text-sm font-medium">Phone Number</label>
            <InputText :value="hod.user.phoneNumber" readonly type="text" fluid />
          </div>
          <div class="grid gap-1">
            <label for="email" class="text-sm font-medium">Email</label>
            <InputText :value="hod.user.email" readonly type="text" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1 mt-3">
          <div class="md:col-span-2 flex items-center gap-2">
            <p class="text-sm font-medium">Change H.O.D</p>
            <Button
              :severity="isChangingHod ? 'danger' : 'primary'"
              :icon="isChangingHod ? 'pi pi-times' : 'pi pi-user-edit'"
              text
              @click="changeHod"
            />
          </div>

          <InputGroup v-if="isChangingHod">
            <Select
              v-model="selectedStaff"
              :loading="loadingStaffs"
              :options="staffs"
              option-label="user.name"
              :placeholder="loadingStaffs ? 'Getting staffs' : 'Select staff'"
              fluid
            />
            <Button :loading="savingHod" icon="pi pi-check" @click="saveNewHod" />
          </InputGroup>
        </div>

        <div class="grid gap-1 mt-3">
          <p class="text-sm text-red-500 font-medium">Reset H.O.D Login</p>
          <Button
            @click="confirmReset"
            :loading="resetLoading"
            severity="danger"
            outlined
            icon="pi pi-lock"
            label="Reset Login"
            class="w-40"
          />
        </div>
      </VCard>
    </div>
  </section>
</template>
