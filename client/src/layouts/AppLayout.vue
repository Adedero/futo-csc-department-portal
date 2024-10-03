<script setup>
import { ref } from 'vue'

const isOpen = ref(JSON.parse(localStorage.getItem('navbar')) || false)
const toggle = () => {
  isOpen.value = !isOpen.value
  localStorage.setItem('navbar', JSON.stringify(isOpen.value))
}
</script>

<template>
  <main class="h-dvh flex relative">
    <nav
      :class="[
        isOpen ? 'w-72 lg:w-[17rem]' : 'w-0',
        'z-20 transition-all flex-shrink-0 overflow-x-hidden absolute h-dvh shadow-lg lg:relative lg:shadow-none lg:border-r'
      ]"
    >
      <slot name="navbar" :toggle></slot>
    </nav>

    <div
      @click="toggle"
      id="nav-overlay"
      :class="[
        'lg-hidden bg-slate-900 h-full w-full fixed overflow-hidden lg:hidden',
        isOpen ? 'z-10 opacity-10' : 'opacity-0 -z-20'
      ]"
    ></div>

    <section class="w-dvw lg:w-auto lg:flex-grow min-w-0">
      <header class="overflow-hidden flex items-center gap-5 h-16">
        <div class="h-full w-16 grid place-content-center">
          <Button @click="toggle" outlined icon="pi pi-bars" />
        </div>

        <div class="h-full flex flex-grow items-center gap-2 justify-between">
          <div class="flex items-center gap-1">
            <NacosLogo width="40" />
            <div class="leading-4 hidden md:block">
              <small>Federal University of Owerri</small>
              <p class="text-sm font-bold">Department of Computer Science</p>
            </div>
          </div>

          <div class="w-fit h-full">
            <slot name="header"></slot>
          </div>
        </div>
      </header>

      <div class="h-[calc(100dvh-4rem)] bg-[--p-surface-100]">
        <slot name="content"></slot>
      </div>
    </section>
  </main>
</template>
