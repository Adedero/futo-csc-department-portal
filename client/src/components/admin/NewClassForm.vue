<script setup>
import { computed, ref } from 'vue'

defineProps({
  header: { type: String },
  staffs: { type: Array }
})
const emit = defineEmits(['add-class', 'hide'])

const visible = ref(false)

const studentClass = ref({
  isActive: true,
  advisor: null,
  newAdvisor: null
})

const disabled = computed(() => {
  return (
    !studentClass.value.className ||
    !studentClass.value.currentLevel ||
    !studentClass.value.enrolmentYear
  )
})

const addClass = () => {
  emit('add-class', studentClass.value)
  visible.value = false
}

const open = () => (visible.value = true)
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
      <FormContainer optional>
        <template #requiredFields>
          <div class="mt-2 grid gap-3 w-80">
            <div class="w-full">
              <label for="class-name" class="text-sm font-medium block">Name</label>
              <InputMask
                v-model.trim="studentClass.className"
                id="class-name"
                mask="9999-9999"
                class="w-full"
                placeholder="Class name"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Enrolment Year</label>
              <InputMask
                v-model="studentClass.enrolmentYear"
                mask="9999"
                class="w-full"
                placeholder="Year of enrolment"
              />
            </div>

            <div class="w-full">
              <label class="text-sm font-medium block">Level</label>
              <Select
                v-model="studentClass.currentLevel"
                :options="[100, 200, 300, 400, 500, 600, 700, 800, 900, 0]"
                class="w-full"
                placeholder="Current level"
              />
            </div>

            <div class="w-full">
              <ToggleButton
                v-model="studentClass.isActive"
                onLabel="ACTIVE"
                offLabel="GRADUATED"
                class="w-full"
              />
            </div>
          </div>
        </template>

        <template #optionalFields>
          <div class="w-full mt-2">
            <label class="text-sm font-medium block">Advisor</label>
            <Select
              v-model="studentClass.newAdvisor"
              :options="staffs"
              option-label="user.name"
              class="w-full"
              placeholder="Class Advisor"
            />
          </div>
        </template>
      </FormContainer>
      <Button
        @click="addClass"
        label="Done"
        icon="pi pi-check"
        :disabled="disabled"
        class="mt-2 w-full"
      />
    </Dialog>
  </div>
</template>
