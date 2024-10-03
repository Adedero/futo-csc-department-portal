<script setup>
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'sep', 'oct', 'nov', 'dec']
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const now = new Date()
</script>

<template>
  <div class="h-24 w-24 rounded-xl overflow-hidden flex flex-col">
    <header class="bg-red-500 px-2 pt-2 flex items-center justify-between">
      <p class="text-white">{{ months[now.getMonth()].toUpperCase() }}</p>
      <div class="grid grid-cols-3 gap-1">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-slate-200 w-[0.3rem] aspect-square rounded-full"
        ></div>
      </div>
    </header>

    <div class="bg-slate-200 text-slate-500 flex-grow grid place-content-center text-center">
      <h1 class="text-4xl">{{ now.getDate() }}</h1>
      <small>{{ days[now.getDay()] }}</small>
    </div>
  </div>
</template>
