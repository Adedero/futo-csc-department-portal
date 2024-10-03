<script setup>
defineProps({
  header: { type: String },
  optional: { type: Boolean, default: false }
})
</script>

<template>
  <div>
    <h1 v-show="header" class="text-lg font-bold">{{ header }}</h1>
    <div>
      <p class="text-red-500 text-sm">Required fields</p>
      <slot name="requiredFields"></slot>

      <VTab v-if="optional" header="Optional Fields">
        <slot name="optionalFields"></slot>
      </VTab>
    </div>
  </div>
</template>
