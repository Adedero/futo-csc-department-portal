<script setup>
defineProps({
  bgColor: { type: String, default: 'bg-red-500' },
  textColor: { type: String, default: 'text-red-500' },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: 'pi pi-question-circle' }
})
</script>

<template>
  <div class="bg-white border p-4 rounded-md flex items-center gap-2 overflow-hidden shadow-sm">
    <div
      :class="[bgColor, 'grid place-content-center p-2 aspect-square w-12 text-white rounded-full']"
    >
      <span :class="icon" style="font-size: 1.8rem; font-weight: lighter"></span>
    </div>

    <div class="leading-3">
      <h1 :class="[textColor, 'text-2xl font-bold']">{{ value }}</h1>
      <small class="font-bold uppercase">{{ label }}</small>
    </div>
  </div>
</template>
