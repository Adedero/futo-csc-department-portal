<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  staff: { type: Object, required: true },
  sessions: { type: Array, required: true },
  model: { type: String, default: 'staff' }
})

const router = useRouter()
const result = ref({})

const visible = ref(false)
const open = () => (visible.value = true)

const toAddResult = () => {
  if (!result.value.session || !result.value.course) return
  router.push({
    name: `${props.model}-add-result`,
    params: {
      staffId: props.staff._id,
      session: result.value.session.name,
      semester: result.value.course.semester,
      level: result.value.course.level,
      course: result.value.course.code.split(' ').join('-')
    }
  })
}
</script>

<template>
  <div>
    <slot name="addButton" :open></slot>
    <Dialog
      v-model:visible="visible"
      modal
      header="New Class"
      class="z-10 max-w-96"
      @hide="$emit('hide')"
    >
      <div class="mt-2 grid gap-3 w-80">
        <div class="w-full">
          <label class="text-sm font-medium block">Course Code</label>
          <Select
            v-model.trim="result.course"
            :options="staff.courses"
            option-label="code"
            fluid
            placeholder="Select course"
          />
        </div>

        <div class="w-full">
          <label class="text-sm font-medium block">Session</label>
          <Select
            v-model.trim="result.session"
            :options="sessions"
            option-label="name"
            fluid
            placeholder="Select session"
          />
        </div>
      </div>
      <Button @click="toAddResult" label="Done" icon="pi pi-check" class="mt-2 w-full" />
    </Dialog>
  </div>
</template>
