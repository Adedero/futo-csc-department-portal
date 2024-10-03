<script setup>
defineProps({
  user: { type: Object },
  image: { type: String },
  myClass: { type: String },
  fluid: { type: Boolean },
  rounded: { type: Boolean }
})
</script>

<template>
  <img
    v-if="user"
    :src="user.image"
    :alt="user.name"
    :class="[
      'aspect-square object-cover',
      myClass,
      rounded ? 'rounded-full' : 'rounded-md',
      fluid && 'w-full'
    ]"
  />

  <img
    v-else-if="image"
    :src="image"
    alt="user"
    :class="[
      'aspect-square object-cover',
      myClass,
      rounded ? 'rounded-full' : 'rounded-md',
      fluid && 'w-full'
    ]"
  />

  <img v-else src="../../assets/img/user.jpg" :class="myClass" />
</template>
