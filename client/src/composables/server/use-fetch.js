import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'

export const useGet = async (
  url,
  config = {
    skip: false,
    router: null,
    toast: null,
    toastLife: 5000,
    refetch: false,
    toastOnSuccess: false,
    successSummary: 'Successful',
    successDetail: 'Your request was completed successfully.',
    sendToken: true,
    timeout: null
  },
  done
) => {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const status = ref(null)
  const response = ref(null)

  const _fetch = async function getRequest(api) {
    const userStore = useUserStore()
    const token = userStore.token

    const abortController = new AbortController()
    let timer = null

    if (config.sendToken && !token) {
      return config.router.push({ name: 'login' })
    }

    if (loading.value) return

    loading.value = true

    timer = setTimeout(
      () => {
        abortController.abort()
      },
      config.timeout || 1000 * 60
    )

    try {
      response.value = await fetch(`${import.meta.env.VITE_SERVER_URL}${api}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-type': 'application/json'
        },
        signal: abortController.signal
      })

      const payload = await response.value.json()

      if (!payload) {
        config.router.push('/500')
        return
      }

      status.value = response.value.status

      if (status.value === 401 || payload.authMessage) {
        config.router.push({ name: 'login' })
        return
      }

      if (status.value === 403) {
        config.router.push('/403')
        return
      }

      if (status.value === 404) {
        config.router.push('/404')
        return
      }

      if (status.value !== 200) {
        config.toast.open({
          position: 'top-right',
          type: 'error',
          message: payload.message
            ? payload.message
            : 'The request could not be completed. Please, try again later.',
          duration: config.toastLife || 5000
        })

        error.value = payload.message
        data.value = null
        return
      }

      data.value = payload
      error.value = null

      if (config.toastOnSuccess) {
        config.toast.open({
          position: 'top-right',
          type: 'success',
          message: config.successDetail ? config.successDetail : data.value.message,
          duration: config.toastLife || 5000
        })
      }

      if (typeof done === 'function') {
        done(data.value)
      }
    } catch (err) {
      console.error(err)
      error.value = err.message

      if (err instanceof DOMException && err.name === 'AbortError') {
        config.toast.open({
          position: 'top-right',
          type: 'default',
          message: 'That took too long. Please, check your internet connection and try again',
          duration: config.toastLife || 5000
        })

        return
      }

      config.toast.open({
        position: 'top-right',
        type: 'error',
        message: err.message,
        duration: config.toastLife || 5000
      })
    } finally {
      loading.value = false
      if (timer) {
        clearTimeout(timer)
      }
    }
  }

  await _fetch(url)

  watch(
    () => url,
    async (newValue) => {
      if (config.refetch) await _fetch(newValue)
    }
  )

  return { response, loading, status, data, error, _fetch }
}

export const useFormGet = async (
  url,
  config = {
    skip: false,
    router: null,
    toast: null,
    toastLife: 5000,
    refetch: false,
    toastOnSuccess: false,
    successSummary: 'Successful',
    successDetail: 'Your request was completed successfully.',
    sendToken: true,
    timeout: null
  }
) => {
  const loading = ref(false)
  const error = ref(null)
  const status = ref(null)
  const response = ref(null)
  const payload = ref(null)

  const _fetch = async function getRequest(api) {
    const userStore = useUserStore()
    const token = userStore.token

    const abortController = new AbortController()
    let timer = null

    if (config.sendToken && !token) {
      return config.router.push({ name: 'login' })
    }

    if (loading.value) return

    loading.value = true

    timer = setTimeout(
      () => {
        abortController.abort()
      },
      config.timeout || 1000 * 60
    )

    try {
      response.value = await fetch(`${import.meta.env.VITE_SERVER_URL}${api}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal: abortController.signal
      })

      status.value = response.value.status
      payload.value = await response.value.clone()

      if (!payload.value) {
        config.router.push('/500')
        return
      }

      if (status.value === 401) {
        config.router.push({ name: 'login' })
        return
      }

      if (status.value === 403) {
        config.router.push('/403')
        return
      }

      if (status.value === 404) {
        config.router.push('/404')
        return
      }

      if (status.value !== 200) {
        config.toast.open({
          position: 'top-right',
          type: 'error',
          message: 'The request could not be completed. Please, try again later.',
          duration: config.toastLife || 5000
        })

        error.value = true
        return
      }
    } catch (err) {
      console.error(err)
      error.value = err.message

      if (err instanceof DOMException && err.name === 'AbortError') {
        config.toast.open({
          position: 'top-right',
          type: 'default',
          message: 'That took too long. Please, check your internet connection and try again',
          duration: config.toastLife || 5000
        })

        return
      }
      config.toast.open({
        position: 'top-right',
        type: 'error',
        message: err.message,
        duration: config.toastLife || 5000
      })
    } finally {
      loading.value = false
      if (timer) {
        clearTimeout(timer)
      }
    }
  }

  await _fetch(url)

  watch(
    () => url,
    async (newValue) => {
      if (config.refetch) await _fetch(newValue)
    }
  )

  return { response, loading, status, payload, error, _fetch }
}

//POST, PUT, PATCH AND DELETE requests
export const usePost = async (
  url,
  config = {
    skip: false,
    body: null,
    method: 'POST',
    router: null,
    toast: null,
    toastLife: 5000,
    refetch: false,
    sendToken: true,
    toastOnSuccess: false,
    successSummary: 'Successful',
    successDetail: 'Your request was completed successfully.',
    timeout: null,
    contentType: 'application/json'
  },
  done
) => {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const status = ref(null)

  const _fetch = async function postRequest(api) {
    const userStore = useUserStore()
    const token = userStore.token
    const abortController = new AbortController()
    let timer = null

    if (config.sendToken) {
      if (!token) return config.router.push({ name: 'login' })
    }

    if (loading.value) return

    loading.value = true

    timer = setTimeout(
      () => {
        abortController.abort()
      },
      config.timeout || 1000 * 15
    )

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${api}`, {
        method: config.method ? config.method : 'POST',
        headers: {
          'Content-Type': config.contentType || 'application/json',
          Authorization: 'Bearer ' + token
        },
        signal: abortController.signal,
        body: JSON.stringify(config.body)
      })

      const payload = await res.json()

      if (!payload) {
        config.router.push('/500')
        return
      }

      status.value = res.status

      if (res.status === 401 && payload.authMessage) {
        config.router.push({ name: 'login' })
        return
      }

      if (res.status === 403) {
        config.router.push('/403')
        return
      }

      if (res.status === 404) {
        config.router.push('/404')
        return
      }

      if (res.status !== 200) {
        config.toast.open({
          position: 'top-right',
          type: 'error',
          message: payload.message
            ? payload.message
            : 'The request could not be completed. Please, try again later.',
          duration: config.toastLife || 5000
        })

        error.value = payload.message
        data.value = null
        return
      }

      data.value = payload
      error.value = null

      if (config.toastOnSuccess) {
        config.toast.open({
          position: 'top-right',
          type: 'success',
          message: config.successDetail ? config.successDetail : data.value.message,
          duration: config.toastLife || 5000
        })
      }

      if (typeof done === 'function') {
        done(data.value)
      }
    } catch (err) {
      console.error(err)
      error.value = err.message
      if (err instanceof DOMException && err.name === 'AbortError') {
        config.toast.open({
          position: 'top-right',
          type: 'default',
          message: 'That took too long. Please, check your internet connection and try again',
          duration: config.toastLife || 5000
        })

        return
      }

      config.toast.open({
        position: 'top-right',
        type: 'error',
        message: err.message,
        duration: config.toastLife || 5000
      })
    } finally {
      loading.value = false
      if (timer) {
        clearTimeout(timer)
      }
    }
  }

  await _fetch(url)

  watch(
    () => url,
    async (newValue) => {
      if (config.refetch === true) await _fetch(newValue)
    }
  )

  return { loading, status, data, error, _fetch }
}

//MULTIPART FORM DATA
//POST, PUT, PATCH AND DELETE requests
export const useFormPost = async (
  url,
  config = {
    skip: false,
    body: null,
    method: 'POST',
    router: null,
    toast: null,
    toastLife: 5000,
    refetch: false,
    sendToken: true,
    toastOnSuccess: false,
    successSummary: 'Successful',
    successDetail: 'Your request was completed successfully.',
    timeout: null
  },
  done
) => {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const status = ref(null)

  const _fetch = async function postRequest(api) {
    const userStore = useUserStore()
    const token = userStore.token
    const abortController = new AbortController()
    let timer = null

    if (config.sendToken) {
      if (!token) return config.router.push({ name: 'login' })
    }

    if (loading.value) return

    loading.value = true

    timer = setTimeout(
      () => {
        abortController.abort()
      },
      config.timeout || 1000 * 20
    )

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}${api}`, {
        method: config.method ? config.method : 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        signal: abortController.signal,
        body: config.body
      })

      const payload = await res.json()

      if (!payload) {
        config.router.push('/500')
        return
      }

      status.value = res.status

      if (res.status === 401 && payload.authMessage) {
        config.router.push({ name: 'login' })
        return
      }

      if (res.status === 403) {
        config.router.push('/403')
        return
      }

      if (res.status === 404) {
        config.router.push('/404')
        return
      }

      if (res.status !== 200) {
        config.toast.open({
          position: 'top-right',
          type: 'error',
          message: payload.message
            ? payload.message
            : 'The request could not be completed. Please, try again later.',
          duration: config.toastLife || 5000
        })

        error.value = payload.message
        data.value = null
        return
      }

      data.value = payload
      error.value = null

      if (config.toastOnSuccess) {
        config.toast.open({
          position: 'top-right',
          type: 'success',
          message: config.successDetail ? config.successDetail : data.value.message,
          duration: config.toastLife || 5000
        })
      }

      if (typeof done === 'function') {
        done(data.value)
      }
    } catch (err) {
      console.error(err)
      error.value = err.message
      if (err instanceof DOMException && err.name === 'AbortError') {
        config.toast.open({
          position: 'top-right',
          type: 'default',
          message: 'That took too long. Please, check your internet connection and try again',
          duration: config.toastLife || 5000
        })

        return
      }

      config.toast.open({
        position: 'top-right',
        type: 'error',
        message: err.message,
        duration: config.toastLife || 5000
      })
    } finally {
      loading.value = false
      if (timer) {
        clearTimeout(timer)
      }
    }
  }

  await _fetch(url)

  watch(
    () => url,
    async (newValue) => {
      if (config.refetch === true) await _fetch(newValue)
    }
  )

  return { loading, status, data, error, _fetch }
}
