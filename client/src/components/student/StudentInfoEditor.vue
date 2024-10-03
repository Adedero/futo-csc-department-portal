<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import upload from '@/composables/server/file-upload'

const props = defineProps({
  student: { type: Object, required: true }
});

const emit = defineEmits(['image-change'])

const router = useRouter()
const toast = useToast()
const isEditing = ref(false)

const cancelEdit = () => {
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
    uploader: 'student',
    model: 'student',
    router,
    toast
  })
  imageLoading.value = false
  emit('image-change', data.value.url)
  isEditing.value = false
}

</script>

<template>
  <div>
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
        <p v-if="student.image.length" class="text-sm text-slate-500 font-semibold">Contact admin to change image.</p>
        <FileUploader v-if="!student.image" :loading="imageLoading" @select="handleSelect" @upload="uploadImage" accept=".jpg,.jpeg,.png"
          :maxFileSize="1024 * 300" invalidFileSizeMessage="Image must be 300KB or less"
          invalidFileTypeMessage="Image can only be .jpg, .jpeg, or .png" class="w-full" />
      </div>

      <Divider />

      <PasswordChanger model="student" :user-id="student.userId" :username="student.username" />
    </div>
  </div>
</template>
