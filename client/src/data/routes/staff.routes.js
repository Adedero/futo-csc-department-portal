const staffRoutes = [
  {
    path: '',
    name: 'staff-dashboard',
    component: () => import('@/views/staff/StaffDashboardView.vue')
  },
  {
    path: 'results',
    name: 'staff-results',
    component: () => import('@/views/staff/StaffResultsView.vue')
  },
  {
    path: 'view-result/:resultId',
    name: 'staff-ogr-result',
    component: () => import('@/views/staff/StaffOgrResultView.vue')
  },
  {
    path: 'add-result/:staffId/:session/:semester/:level/:course',
    name: 'staff-add-result',
    component: () => import('@/views/staff/StaffAddResultView.vue')
  },
  {
    path: 'edit-result/:resultId',
    name: 'staff-edit-result',
    component: () => import('@/views/staff/StaffEditResultView.vue')
  },
  {
    path: 'account',
    name: 'staff-account',
    component: () => import('@/views/staff/StaffAccountView.vue')
  }
]

export default staffRoutes
