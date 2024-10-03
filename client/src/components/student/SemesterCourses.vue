<script setup>
import { ref } from 'vue'

defineProps({
  semesterCourses: { type: Array, required: true }
})

const visible = ref(false)

const course = ref({})

const viewDetails = (data) => {
  course.value = { ...data }
  visible.value = true
}
</script>
<template>
  <div>
    <DataTable
      :value="semesterCourses"
      size="small"
      dataKey="_id"
      scrollable
      tableStyle="min-width: 0"
    >
      <Column field="code" header="Code" style="min-width: 6rem"> </Column>

      <Column field="title" header="Title" style="width: 25%; min-width: 20rem"> </Column>

      <Column field="unit" header="Units" style="min-width: 4rem"></Column>

      <Column field="isElective" header="Type" style="width: 25%">
        <template #body="{ data }">
          {{ data.isElective ? 'ELECTIVE' : 'COMPULSORY' }}
        </template>
      </Column>

      <Column>
        <template #body="slotProps">
          <Button
            @click="viewDetails(slotProps.data)"
            label="Details"
            size="small"
            icon="pi pi-book"
            outlined
            rounded
          />
        </template>
      </Column>
    </DataTable>

    <Drawer
      v-model:visible="visible"
      position="right"
      header="Course Details"
      class="w-dvw md:w-[24rem] lg:w-[28rem]"
    >
      <CourseDetails :course />
    </Drawer>
  </div>
</template>
