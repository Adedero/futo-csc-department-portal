import { ref } from 'vue'
import { useFormPost } from './use-fetch'

const upload = {
  image: async (
    file,
    id,
    config = {
      uploader: 'admin',
      model: 'student',
      router: null,
      toast: null,
      toastOnSuccess: true
    }
  ) => {
    const data = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('uploader', config.uploader)
    formData.append('model', config.model)

    loading.value = true

    const { data: payload, error: err } = await useFormPost(
      `/api/${config.uploader}/change-user-image/${id}`,
      {
        router: config.router,
        toast: config.toast,
        body: formData,
        toastOnSuccess: config.toastOnSuccess || true,
        successDetail: 'Done',
        toastLife: 3000
      }
    )
    data.value = payload.value
    error.value = err.value
    loading.value = false
    return { data, loading, error }
  }
}

export default upload
