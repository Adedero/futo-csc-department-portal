<script setup>
import { useGet } from '@/composables/server/use-fetch';
import { formatGPA, useDate } from '@/composables/utils/format';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

const router = useRouter();
const toast = useToast();

const { data: results } = await useGet('/api/student/results', { router, toast });
</script>

<template>
  <main class="w-full h-full p-2 overflow-y-auto">
    <VCard>
      <h1 class="text-lg font-bold">Results:
        <Badge :value="results.length" />
      </h1>
    </VCard>

    <VCard class="mt-2">
      <div class="w-full overflow-x-auto">
        <DataTable :value="results" dataKey="_id" scrollable tableStyle="min-width: 0">
          <Column field="session" header="Session" sortable> </Column>

          <Column field="semester" header="Semester"> </Column>

          <Column field="level" header="Level" sortable></Column>

          <Column field="courses" header="Courses"></Column>

          <Column header="GPA">
            <template #body="slotProps">
              {{ formatGPA(slotProps.data.GPA) }}
            </template>
          </Column>

          <Column header="Date">
            <template #body="slotProps">
              {{ useDate(slotProps.data.timestamp) }}
            </template>
          </Column>

          <Column>
            <template #body="slotProps">
              <Button @click="$router.push(`/student/result/${slotProps.data._id}`)" size="small" rounded label="View" outlined icon="pi pi-eye" />
            </template>
          </Column>
        </DataTable>
      </div>
    </VCard>
  </main>
</template>