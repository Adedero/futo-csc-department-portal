<script setup>
defineProps({
  course: { type: Object, required: true }
})
</script>

<template>
  <div class="h-full w-full">
    <h1 title="course-title" class="text-[--p-primary-color] font-bold text-lg">
      {{ course.title }}
    </h1>

    <div class="flex items-center flex-wrap text-sm mt-2">
      <p class="p-1 font-medium">{{ course.code }}</p>
      <Divider layout="vertical" />
      <p class="p-1 font-medium">{{ course.unit }} Units</p>
      <Divider layout="vertical" />
      <p class="p-1 font-medium">{{ course.isElective ? 'ELECTIVE' : 'COMPULSORY' }}</p>
    </div>

    <p class="mt-6 font-bold text-sm">Marks Distribution</p>

    <div
      :class="[
        'mt-2 h-11 rounded-r-full overflow-hidden grid',
        course.hasPractical ? 'grid-cols-5' : 'grid-cols-10'
      ]"
    >
      <div
        :class="[
          'bg-[--p-yellow-200] grid place-content-center text-sm font-bold',
          course.hasPractical ? 'col-span-1' : 'col-span-3'
        ]"
      >
        {{ course.hasPractical ? '20%' : '30%' }}
      </div>

      <div
        v-if="course.hasPractical"
        class="bg-[--p-orange-200] grid place-content-center text-sm font-bold col-span-1"
      >
        20%
      </div>
      <div
        :class="[
          'bg-[--p-green-200] grid place-content-center text-sm font-bold',
          course.hasPractical ? 'col-span-3' : 'col-span-7'
        ]"
      >
        {{ course.hasPractical ? '60%' : '70%' }}
      </div>
    </div>

    <div class="mt-3 flex items-center gap-3">
      <div class="flex items-center gap-1">
        <div class="aspect-square w-3 rounded-full shrink-0 bg-[--p-yellow-200]"></div>
        <p class="text-xs font-bold">test</p>
      </div>

      <div v-if="course.hasPractical" class="flex items-center gap-1">
        <div class="aspect-square w-3 rounded-full shrink-0 bg-[--p-orange-200]"></div>
        <p class="text-xs font-bold">practical</p>
      </div>

      <div class="flex items-center gap-1">
        <div class="aspect-square w-3 rounded-full shrink-0 bg-[--p-green-200]"></div>
        <p class="text-xs font-bold">exam</p>
      </div>
    </div>

    <p class="mt-6 font-bold text-sm">Course Description</p>

    <div class="mt-3 border-2 border-[--p-surface-200] text-sm rounded-md p-2">
      {{ course.description }}
    </div>
  </div>
</template>
