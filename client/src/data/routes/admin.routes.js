const adminRoutes = [
  {
    path: '',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue')
  },
  {
    path: 'students',
    name: 'admin-students',
    component: () => import('@/views/admin/students/AdminStudentsView.vue')
  },
  {
    path: 'student/:id',
    name: 'admin-student',
    component: () => import('@/views/admin/students/AdminStudentView.vue')
  },
  {
    path: 'student-course-registration-details/:id',
    name: 'admin-student-course-registration-details',
    component: () => import('@/views/admin/students/AdminStudentCourseRegDetailsView.vue')
  },
  {
    path: 'staffs',
    name: 'admin-staffs',
    component: () => import('@/views/admin/staffs/AdminStaffsView.vue')
  },
  {
    path: 'staff/:id',
    name: 'admin-staff',
    component: () => import('@/views/admin/staffs/AdminStaffView.vue')
  },
  {
    path: 'advisors',
    name: 'admin-advisors',
    component: () => import('@/views/admin/staffs/AdminAdvisorsView.vue')
  },
  {
    path: 'hod-dean',
    name: 'admin-hod-dean',
    component: () => import('@/views/admin/staffs/AdminHodDeanView.vue')
  },
  {
    path: 'administrators',
    name: 'admin-admins',
    component: () => import('@/views/admin/AdminsView.vue')
  },
  {
    path: 'student-classes',
    name: 'admin-classes',
    component: () => import('@/views/admin/classes/AdminClassesView.vue')
  },
  {
    path: 'student-class/:id',
    name: 'admin-class',
    component: () => import('@/views/admin/classes/AdminClassView.vue')
  },
  {
    path: 'courses',
    name: 'admin-courses',
    component: () => import('@/views/admin/AdminCoursesView.vue')
  },
  {
    path: 'pins',
    name: 'admin-pins',
    component: () => import('@/views/admin/AdminPinsView.vue')
  },
  {
    path: 'settings',
    name: 'admin-settings',
    component: () => import('@/views/admin/AdminSettingsView.vue')
  },
  {
    path: 'account',
    name: 'admin-account',
    component: () => import('@/views/admin/AdminAccountView.vue')
  }
]

export default adminRoutes
