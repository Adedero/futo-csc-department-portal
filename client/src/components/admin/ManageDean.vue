<script setup>
import { ref } from 'vue'
import { usePost } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import upload from '@/composables/server/file-upload'
import { useConfirm } from 'primevue/useconfirm'

const props = defineProps({
  dean: { type: Object, required: true }
})

const emit = defineEmits(['update-dean-details', 'change-dean', 'image-change'])

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const deanDetails = ref({
  title: props.dean.user.title,
  name: props.dean.user.name,
  staffId: props.dean.staffId
})

//Editing title, name and staffId
const isEditing = ref(false)

const cancelEdit = () => {
  deanDetails.value = {
    title: props.dean.user.title,
    name: props.dean.user.name,
    staffId: props.dean.staffId
  }
  isEditing.value = false
}

const saveLoading = ref(false)
const saveEdits = async () => {
  if (
    deanDetails.value.title === props.dean.user.title &&
    deanDetails.value.name === props.dean.user.name &&
    deanDetails.value.staffId === props.dean.staffId
  ) {
    isEditing.value = false
    return
  }
  saveLoading.value = true
  await usePost(
    `/api/admin/change-dean-details?deanId=${props.dean._id}&userId=${props.dean.user._id}`,
    {
      method: 'PUT',
      body: deanDetails.value,
      router,
      toast,
      toastOnSuccess: true,
      successDetail: 'Done',
      toastLife: 3000
    },
    (data) => {
      emit('update-dean-details', data)
      cancelEdit()
    }
  )
  saveLoading.value = false
}

//Changing Dean image
const isChangingImage = ref(false)
const imageUrl = ref(props.dean.user.image)

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
  const { data } = await upload.image(file, props.dean._id, {
    uploader: 'admin',
    model: 'dean',
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
  imageUrl.value = props.dean.user.image
}

//Resetting login
const resetLoading = ref(false)
const resetLogin = async () => {
  resetLoading.value = true
  await usePost(`/api/admin/reset-login/${props.dean.user._id}/dean`, {
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
    message: `The Deans's username and password will be reset to their staff ID. Proceed?`,
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
    class="mt-2 w-full grid content-start gap-3 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-10"
  >
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
          <VAvatar :image="imageUrl ? imageUrl : dean.user.image" rounded fluid />
        </div>

        <div class="text-center">
          <h1 class="text-lg font-semibold">{{ dean.user.title }}</h1>
          <h1 class="text-lg font-semibold">{{ dean.user.name }}</h1>
          <h1>Dean, DICT</h1>
        </div>

        <Button @click="isChangingImage = true" icon="pi pi-user-edit" rounded outlined />
      </div>
    </aside>

    <div class="grid gap-3 md:col-span-7 lg:col-span-9 xl:col-span-7">
      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-user" style="font-size: 0.9rem"></span>
          <h1 class="font-semibold">Dean</h1>
        </div>
        <Divider />

        <div class="grid gap-3 md:grid-cols-2">
          <div class="grid gap-1">
            <label for="phone-number" class="text-sm font-medium">Phone Number</label>
            <InputText :value="dean.user.phoneNumber" readonly type="text" fluid />
          </div>
          <div class="grid gap-1">
            <label for="email" class="text-sm font-medium">Email</label>
            <InputText :value="dean.user.email" readonly type="text" fluid />
          </div>
        </div>

        <div class="mt-3">
          <div class="md:col-span-2 flex items-center gap-2">
            <p class="text-sm font-medium">Edit Profile</p>
            <Button @click="isEditing = true" icon="pi pi-user-edit" text />
          </div>

          <div class="mt-1 grid gap-3 md:grid-cols-3">
            <div class="grid gap-1">
              <label class="text-sm font-medium">Title</label>
              <InputText v-model="deanDetails.title" :disabled="!isEditing" type="text" fluid />
            </div>
            <div class="grid gap-1">
              <label class="text-sm font-medium">Name</label>
              <InputText v-model="deanDetails.name" :disabled="!isEditing" type="text" fluid />
            </div>
            <div class="grid gap-1">
              <label class="text-sm font-medium">Staff ID</label>
              <InputMask
                v-model="deanDetails.staffId"
                mask="9999aa"
                :disabled="!isEditing"
                type="text"
                fluid
              />
            </div>

            <div v-if="isEditing" class="flex items-center gap-2 md:col-span-3">
              <Button @click="saveEdits" :loading="saveLoading" label="Save" icon="pi pi-check" />
              <Button @click="cancelEdit" label="Cancel" icon="pi pi-times" severity="secondary" />
            </div>
          </div>
        </div>

        <div class="mt-3">
          <p class="text-sm font-medium">Settings</p>

          <div class="flex items-center gap-3 mt-3">
            <NewDeanForm
              create="false"
              :dean-id="dean._id"
              @add-dean="(newDean) => $emit('change-dean', newDean)"
            >
              <template #addButton="{ open }">
                <Button @click="open" label="Change Dean" icon="pi pi-user-plus" />
              </template>
            </NewDeanForm>

            <Button
              @click="confirmReset"
              :loading="resetLoading"
              label="Reset Login"
              icon="pi pi-lock"
              severity="danger"
              outlined
            />
          </div>
        </div>
      </VCard>
    </div>
  </section>
</template>
