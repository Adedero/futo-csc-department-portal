<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useGet } from '@/composables/server/use-fetch'
import { useToast } from 'vue-toast-notification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data: staff } = await useGet(`/api/hod/staff-profile/${route.params.id}`, { router, toast })

const addCourses = (data) => {
  staff.value.courses.unshift(...data)
}

const removeCourse = (id) => {
  staff.value.courses = staff.value.courses.filter(
    (course) => course._id.toString() !== id.toString()
  )
}

const removeAllCourses = () => (staff.value.courses = [])
</script>

<template>
  <main
    class="w-full h-full overflow-y-auto p-2 grid content-start gap-3 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-10"
  >
    <VCard class="h-fit md:col-span-10 lg:col-span-12 xl:col-span-9">
      <h1 class="font-bold text-xl">Staff Profile</h1>
    </VCard>

    <aside class="md:overflow-y-auto md:col-span-3 lg:col-span-3 xl:col-span-3">
      <div class="text-center flex flex-col gap-5 items-center">
        <div class="w-28 md:w-32 aspect-square rounded-full">
          <VAvatar :image="staff.user.image" rounded fluid />
        </div>
        <div>
          <h1 class="font-semibold text-lg">{{ staff.user.title }}</h1>
          <h1 class="font-semibold text-lg">{{ staff.user.name }}</h1>
          <p class="font-medium">{{ staff.staffId }}</p>
          <p class="text-sm">{{ staff.isActive ? 'CURRENT STAFF' : 'FORMER STAFF' }}</p>
          <Divider />
          <div v-if="staff.isAdvisor" class="grid gap-1 text-sm text-center">
            <p>
              Advisor Status:
              <span class="font-semibold">{{
                staff.isAdvisor ? 'Advisor' : 'Not and Advisor'
              }}</span>
            </p>
            <p>
              Class: <span class="font-semibold">{{ staff.studentClass.className }}</span>
            </p>
            <p>
              Level: <span class="font-semibold">{{ staff.studentClass.currentLevel }}</span>
            </p>
          </div>
        </div>
      </div>
    </aside>

    <div
      class="h-[calc(100dvh-10rem)] grid gap-3 md:overflow-y-auto md:col-span-7 lg:col-span-9 xl:col-span-7"
    >
      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-user" style="font-size: 0.9rem"></span>
          <h1 class="font-semibold">Personal Information</h1>
        </div>
        <Divider />
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div class="grid gap-1 lg:col-span-2">
            <label for="username" class="text-sm font-medium">Username</label>
            <InputText :value="staff.user.username" readonly type="text" id="username" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="date-of-birth" class="text-sm font-medium">Date of Birth</label>
            <InputText :value="staff.dateOfBirth" readonly type="text" id="date-of-birth" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="sex" class="text-sm font-medium">Sex</label>
            <InputText :value="staff.user.sex" readonly type="text" id="sex" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-2">
            <label for="phone-number" class="text-sm font-medium">Phone Number</label>
            <InputText :value="staff.user.phoneNumber" readonly type="text" fluid />
          </div>
          <div class="grid gap-1 md:col-span-2 lg:col-span-4">
            <label for="email" class="text-sm font-medium">Email</label>
            <InputText :value="staff.user.email" readonly type="text" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-3">
            <label for="nationality" class="text-sm font-medium">Nationality</label>
            <InputText :value="staff.nationality" readonly type="text" id="nationality" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-3">
            <label for="state-of-origin" class="text-sm font-medium">State of Origin</label>
            <InputText
              :value="staff.stateOfOrigin"
              readonly
              type="text"
              id="state-of-origin"
              fluid
            />
          </div>

          <div class="grid gap-1 md:col-span-2 lg:col-span-6">
            <label for="address" class="text-sm font-medium">Home Address</label>
            <InputText :value="staff.user.address" readonly type="text" id="address" fluid />
          </div>
        </div>
      </VCard>

      <VCard>
        <div class="flex items-center gap-3">
          <span class="pi pi-briefcase"></span>
          <h1 class="font-semibold">Professional Information</h1>
        </div>
        <Divider />
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div class="grid gap-1 lg:col-span-2">
            <label for="class" class="text-sm font-medium">Rank</label>
            <InputText :value="staff.rank" readonly type="text" id="class" fluid />
          </div>
          <div class="grid gap-1 lg:col-span-4">
            <label class="text-sm font-medium">Qualification</label>
            <InputText :value="staff.qualification.toString()" readonly type="text" fluid />
          </div>
          <div class="grid gap-1 md:col-span-2 lg:col-span-6">
            <label class="text-sm font-medium">Specialization</label>
            <Textarea :value="staff.specialization.toString()" auto-resize readonly fluid />
          </div>
        </div>
      </VCard>

      <ManageStaffCourses
        :staff
        user="hod"
        @add-courses="addCourses"
        @remove-course="removeCourse"
        @remove-all-courses="removeAllCourses"
      />
    </div>
  </main>
</template>
