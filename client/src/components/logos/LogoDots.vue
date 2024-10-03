<script setup>
const colors = ['bg-sky-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500']
</script>
<template>
  <div class="w-fit gap-1.5 lg:gap-1 grid grid-cols-2 grid-rows-2">
    <div
      v-for="cplor in colors"
      :key="cplor"
      :class="cplor"
      class="rounded-full w-3 lg:w-4 aspect-square"
    ></div>
  </div>
</template>
