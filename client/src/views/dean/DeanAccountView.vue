<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import { useGet, usePost } from '@/composables/server/use-fetch'
import { useToast } from 'vue-toast-notification'

const router = useRouter()
const toast = useToast()

const { data: staff } = await useGet('/api/dean/profile', {
  router,
  toast
});

const editing = ref(false);

const edit = ref({ ...staff.value });

const loading = ref(false);
const saveEdit = async () => {
  loading.value = true;
  await usePost(`/api/dean/update-profile/${staff.value.userId}/dean`,
    { method: 'PUT', body: edit.value, router, toast, toastOnSuccess: true, toastLife: 2000 },
    () => {
      editing.value = false;
      staff.value = edit.value;
    }
  );
  loading.value = false;
}

</script>

<template>
  <main
    class="w-full h-full overflow-y-auto p-2 grid content-start gap-3 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-10">
    <VCard class="h-fit md:col-span-10 lg:col-span-12 xl:col-span-9">
      <h1 class="font-bold text-xl">Profile</h1>
    </VCard>

    <aside
      class="border bg-white rounded-md p-5 md:border-0 md:bg-transparent md:rounded-none md:p-0 md:overflow-y-auto md:col-span-3 lg:col-span-3 xl:col-span-3">
      <DeanInfoEditor :staff model="dean" @image-change="(url) => staff.image = url" />
    </aside>

    <div
      class="h-[calc(100dvh-10rem)] flex flex-col gap-3 md:overflow-y-auto md:col-span-7 lg:col-span-9 xl:col-span-7">
      <VCard class="w-full flex-shrink-0">
        <div class="flex items-center gap-2 justify-between">
          <div class="flex items-center gap-3">
            <span class="pi pi-user" style="font-size: 0.9rem"></span>
            <h1 class="font-semibold">Personal Information</h1>
          </div>

          <div class="flex items-center gap-2">
            <Button @click="editing = !editing" :icon="editing ? 'pi pi-times' : 'pi pi-user-edit'"
              :severity="editing ? 'danger' : 'primary'" :outlined="editing" rounded :disabled="loading" />

            <Button v-if="editing" @click="saveEdit" :loading icon="pi pi-check" rounded />
          </div>
        </div>

        <Divider />
        <Message v-show="!staff.email" severity="warn">
          <p class="text-sm">Please add an email to your account. Emails are important for account recovery.</p>
        </Message>

        <div class="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div v-if="!editing" class="grid gap-1 lg:col-span-2">
            <label class="text-sm font-medium">Username</label>
            <InputText :value="staff.username" readonly type="text" fluid />
          </div>

          <div :class="['grid gap-1 md:col-span-1', editing ? 'lg:col-span-3' : 'lg:col-span-2']">
            <label class="text-sm font-medium">Sex</label>
            <InputText v-if="!editing" :value="staff.sex" readonly type="text" fluid />
            <Select v-else v-model="edit.sex" :options="['FEMALE', 'MALE', 'OTHER']" placeholder="e.g. MALE, FEMALE"
              fluid />
          </div>

          <div :class="['grid gap-1 md:col-span-1', editing ? 'lg:col-span-3' : 'lg:col-span-2']">
            <label class="text-sm font-medium">Phone Number</label>
            <InputText v-if="!editing" :value="staff.phoneNumber" readonly type="text" fluid />
            <InputMask v-else v-model="edit.phoneNumber" mask="99999999999" placeholder="0808XXXXXXX" fluid />
          </div>

          <div :class="['grid gap-1 md:col-span-2', editing ? 'lg:col-span-6' : 'lg:col-span-6']">
            <label class="text-sm font-medium">Email</label>
            <InputText v-if="!editing" :value="staff.email" readonly type="text" fluid />
            <InputText v-else v-model="edit.email" placeholder="Enter email" fluid />
          </div>
        </div>
      </VCard>

      <VCard v-if="!editing" class="flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="pi pi-briefcase"></span>
          <h1 class="font-semibold">Professional Information</h1>
        </div>
        <Divider />
        <div class="grid gap-1 lg:col-span-2">
          <label class="text-sm font-medium">Faculty</label>
          <InputText :value="staff.school.fullName" readonly type="text" fluid />
        </div>
      </VCard>
    </div>
  </main>
</template>
