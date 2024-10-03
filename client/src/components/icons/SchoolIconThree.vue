<script setup>
defineProps({
  width: { type: String, default: '60px' },
  height: { type: String, default: '60px' },
  stroke: { type: String, default: '#1e293b' }
})
</script>

<template>
  <svg :width :height viewBox="0 0 48 48" id="a" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        class="b"
        d="m14.2722,5.5246h-1.98c-.9469,0-1.7217.8527-1.7217,1.8949v33.1611c0,1.0422.7748,1.8949,1.7217,1.8949h1.98"
      />
      <path
        class="b"
        d="m14.2722,5.5246v36.9509h21.4354c.9469,0,1.7217-.8527,1.7217-1.8949V7.4195c0-1.0422-.7748-1.8949-1.7217-1.8949H14.2722Z"
      />
    </g>

    <g>
      <path class="b" d="m26.5487,5.8464v7.2056l3.6902-2.1302,3.7233,2.1492v-7.4582" />
    </g>
  </svg>
</template>

<style>
.b {
  fill: none;
  stroke: v-bind(stroke);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
