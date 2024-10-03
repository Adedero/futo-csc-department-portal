<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useGet } from '@/composables/server/use-fetch'

const props = defineProps({
  placeholder: { type: String },
  model: { type: String, required: true, enum: ['student', 'staff', 'advisor', 'user'] }
})

const router = useRouter()
const toast = useToast()

const value = ref('')

const results = ref([])
const visible = ref(false)
const loading = ref(false)
const allLoaded = ref(false)

const skip = computed(() => results.value.length)
const limit = 20

const search = async () => {
  if (!value.value || loading.value || allLoaded.value) return
  if (!props.model) return
  visible.value = true
  loading.value = true
  await useGet(
    `/api/admin/search-actors?value=${value.value}&model=${props.model}&limit=${limit}&skip=${skip.value}`,
    { router, toast },
    (data) => {
      results.value.push(...data)
      if (data.length < limit) allLoaded.value = true
      //console.log(results.value)
      //value.value = '';
    }
  )
  loading.value = false
}

watch(value, () => {
  results.value = []
  allLoaded.value = false
})
</script>

<template>
  <div class="w-full">
    <InputGroup>
      <InputText v-model.trim="value" type="search" @search="search" :placeholder />
      <Button icon="pi pi-search" @click="search" :loading />
    </InputGroup>

    <Drawer v-model:visible="visible" header="Results" position="right">
      <div>
        <slot name="results" :loading :results :value></slot>
        <Button
          class="mt-2"
          v-show="results.length && !allLoaded"
          @click="search"
          :loading
          label="More"
          outlined
        />
      </div>
    </Drawer>
  </div>
</template>
