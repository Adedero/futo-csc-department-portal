const hodRoutes = [
  {
    path: '',
    name: 'hod-dashboard',
    component: () => import('@/views/hod/HodDashboardView.vue')
  },
  {
    path: 'staffs',
    name: 'hod-staffs',
    component: () => import('@/views/hod/HodStaffsView.vue')
  },
  {
    path: 'staff/:id',
    name: 'hod-staff-profile',
    component: () => import('@/views/hod/HodStaffProfileView.vue')
  },
  {
    path: 'course-allocation',
    name: 'hod-course-allocation',
    component: () => import('@/views/hod/HodCourseAllocationView.vue')
  },
  {
    path: 'classes',
    name: 'hod-classes',
    component: () => import('@/views/hod/HodClassesView.vue')
  },
  {
    path: 'results',
    name: 'hod-results',
    component: () => import('@/views/hod/HodResultsView.vue')
  },
  {
    path: 'view-result/:resultId',
    name: 'hod-ogr-result',
    component: () => import('@/views/hod/HodOgrResultView.vue')
  },
  {
    path: 'account',
    name: 'hod-account',
    component: () => import('@/views/hod/HodAccountView.vue')
  }
]

export default hodRoutes
