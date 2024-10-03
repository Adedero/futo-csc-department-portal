<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useGet } from '@/composables/server/use-fetch'

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { data } = await useGet(`/api/advisor/generate-student-transcripts?studentId=${route.params.id}`, { router, toast }, p => console.log(p))
</script>

<template>
  <StudentTranscripts v-if="data" :transcripts="data" />
  <main v-else>Error</main>
</template>
