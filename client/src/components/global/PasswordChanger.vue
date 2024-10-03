<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { usePost } from '@/composables/server/use-fetch';

const props = defineProps({
  model: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true }
});

const router = useRouter();
const toast = useToast();

const password = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const newUsername = ref(props.username);

const disabled = computed(() => {
  return (
    loading.value ||
    !password.value.oldPassword ||
    !password.value.newPassword ||
    !password.value.confirmPassword ||
    password.value.oldPassword === password.value.newPassword
  )
});

const usernameDisabled = computed(() => {
  return !newUsername.value || newUsername.value === props.username
});

const changeUsername = async () => {
  if (newUsername.value.length < 6) {
    return toast.warning('Username must be 6 characters or more.', { position: 'top-right' });
  }
  loading.value = true;
  await usePost(`/api/${props.model}/change-username/${props.userId}`,
    { method: 'PUT', body: { username: newUsername.value }, router, toast, toastOnSuccess: true, toastLife: 2000 },
    () => {
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  );
  loading.value = false;
}

const loading = ref(false);
const changePassword = async () => {
  if (password.value.newPassword.length < 6) {
    return toast.warning('Password must be 6 characters or more.', { position: 'top-right' });
  }
  
  if (password.value.confirmPassword !== password.value.newPassword) {
    return toast.warning('Passwords do not match.', { position: 'top-right' });
  }
  loading.value = true;
  await usePost(`/api/${props.model}/change-password/${props.userId}`,
    { method: 'PUT', body: password.value, router, toast, toastOnSuccess: true, toastLife: 2000 },
    () => {
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  );
  loading.value = false;
}
</script>

<template>
  <div class="grid gap-[0.6rem]">
    <p class="font-semibold text-slate-500 text-sm">Change Username</p>
    <div class="grid gap-1">
      <label class="text-sm font-medium">Username</label>
      <InputText v-model="newUsername" type="text" fluid />
    </div>

    <Button @click="changeUsername" :loading="loading" :disabled="loading || usernameDisabled" label="Save"
      icon="pi pi-check" />

    <Divider />

    <p class="font-semibold text-slate-500 text-sm">Change Password</p>
    <div class="grid gap-1">
      <label class="text-sm font-medium">Old Password</label>
      <Password v-model="password.oldPassword" :feedback="false" toggle-mask fluid />
    </div>

    <div class="grid gap-1">
      <label class="text-sm font-medium">New Password</label>
      <Password v-model="password.newPassword" toggle-mask fluid />
    </div>

    <div class="grid gap-1">
      <label class="text-sm font-medium">Confirm Password</label>
      <Password v-model="password.confirmPassword" toggle-mask :feedback="false" fluid />
    </div>

    <Button @click="changePassword" :loading="loading" :disabled="loading || disabled" label="Save"
      icon="pi pi-check" />
  </div>
</template>