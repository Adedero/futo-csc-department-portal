<script setup>
import { ref } from 'vue'
import signout from '@/composables/server/signout'
import AppLayout from './AppLayout.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const routes = ref([
  { id: 1, name: 'advisor-dashboard', label: 'Dashboard', icon: 'pi pi-home' },
  { id: 2, name: 'advisor-results', label: 'Results', icon: 'pi pi-book' },
  { id: 3, name: 'advisor-class', label: 'Class', icon: 'pi pi-users' },
  { id: 4, name: 'advisor-account', label: 'Account', icon: 'pi pi-user' }
])
</script>

<template>
  <AppLayout>
    <template #header>
      <HeaderInfo :user="userStore.user" />
    </template>

    <template #navbar="{ toggle }">
      <div class="w-full h-full bg-white">
        <div class="text-center p-3 h-44">
          <div class="mx-auto rounded-full w-24 aspect-square bg-slate-400">
            <VAvatar :image="userStore.user.image" rounded fluid />
          </div>
          <p class="font-semibold">{{ userStore.user.name }}</p>
          <small class="text-red-500">ADVISOR</small>
        </div>

        <div class="p-2 flex flex-col gap-1 content-start h-[calc(100%-12rem)]">
          <RouterLink
            v-for="route in routes"
            :key="route.id"
            :to="{ name: route.name }"
            @click="toggle()"
            class="lg:hidden flex-shrink-0"
          >
            <div class="flex items-center gap-4">
              <span :class="route.icon"></span>
              <span>{{ route.label }}</span>
            </div>
          </RouterLink>

          <RouterLink
            v-for="route in routes"
            :key="route.id"
            :to="{ name: route.name }"
            class="hidden lg:inline"
          >
            <div class="flex items-center gap-4 flex-shrink-0">
              <span :class="route.icon"></span>
              <span>{{ route.label }}</span>
            </div>
          </RouterLink>

          <Button
            @click="signout($router)"
            label="Log out"
            icon="pi pi-sign-out"
            outlined
            class="mt-auto"
          />
        </div>
      </div>
    </template>

    <template #content>
      <Suspense>
        <template #default>
          <RouterView />
        </template>

        <template #fallback>
          <div class="w-full h-[calc(100dvh-5rem)] grid place-content-center">
            <ProgressSpinner
              style="width: 50px; height: 50px"
              strokeWidth="8"
              fill="transparent"
              animationDuration=".5s"
              aria-label="Custom ProgressSpinner"
            />
          </div>
        </template>
      </Suspense>
    </template>
  </AppLayout>
</template>

<style scoped>
a {
  @apply p-2 rounded-md hover:bg-[--p-surface-100];
}

a.router-link-exact-active {
  @apply bg-[--p-primary-color] text-white;
}
</style>
