<script setup>
defineProps({
  history: { type: Array, required: true }
})
</script>
<template>
  <div>
    <DataTable :value="history" dataKey="_id" scrollable tableStyle="min-width: 0">
      <Column field="session" header="Session" style="width: 25%; min-width: 6rem"> </Column>

      <Column field="semester" header="Semester" style="width: 25%"></Column>

      <Column field="level" header="Level" style="width: 25%"></Column>

      <Column>
        <template #body="slotProps">
          <Button
            @click="$router.push(`/student/course-registration-details/${slotProps.data._id}`)"
            label="Details"
            size="small"
            icon="pi pi-file"
            outlined
            rounded
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
