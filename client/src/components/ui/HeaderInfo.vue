<script setup>
defineProps({
  user: { type: Object, required: true }
})
</script>

<template>
  <div class="flex items-center h-full gap-1 px-5">
    <div class="hidden text-right lg:block">
      <p class="font-bold text-xs">{{ user.name }}</p>
      <p class="text-xs">{{ user.email ? user.email : user.username }}</p>
    </div>
    <VAvatar :image="user.image" class="w-10" />
  </div>
</template>
