<script setup>
import { useGet } from '@/composables/server/use-fetch'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const { data } = await useGet('/api/admin/hod-and-dean', { router, toast })

const updateDeanDetails = (payload) => {
  data.value.dean.user.title = payload.title
  data.value.dean.user.name = payload.name
  data.value.dean.staffId = payload.staffId
}
</script>

<template>
  <main class="w-full h-full p-2 overflow-y-auto">
    <VCard class="h-fit">
      <h1 class="font-bold text-xl">H.O.D & Dean</h1>
    </VCard>

    <ManageHod v-if="data.hod" :hod="data.hod" @changeHod="(hod) => (data.hod = hod)" />

    <VCard v-else class="mt-2">
      <h1 class="text-lg font-semibold">H.O.D</h1>
      <p class="text-red-500">No H.O.D account found.</p>
      <Button label="Add HOD" icon="pi pi-user-plus" class="mt-2" />
    </VCard>

    <ManageDean
      v-if="data.dean"
      :dean="data.dean"
      @update-dean-details="updateDeanDetails"
      @change-dean="(dean) => (data.dean = dean)"
    />

    <VCard v-else class="mt-2">
      <h1 class="text-lg font-semibold">Dean</h1>
      <p class="text-red-500">No Dean account found.</p>

      <NewDeanForm create="true" @add-dean="(dean) => (data.dean = dean)">
        <template #addButton="{ open }">
          <Button @click="open" label="Add Dean" icon="pi pi-user-plus" class="mt-2" />
        </template>
      </NewDeanForm>
    </VCard>
  </main>
</template>
