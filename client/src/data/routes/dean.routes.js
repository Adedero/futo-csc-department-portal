const deanRoutes = [
  {
    path: '',
    name: 'dean-dashboard',
    component: () => import('@/views/dean/DeanDashboardView.vue')
  },
  {
    path: 'results',
    name: 'dean-results',
    component: () => import('@/views/dean/DeanResultsView.vue')
  },
  {
    path: 'view-result/:resultId',
    name: 'dean-ogr-result',
    component: () => import('@/views/dean/DeanOgrResultView.vue')
  },
  {
    path: 'account',
    name: 'dean-account',
    component: () => import('@/views/dean/DeanAccountView.vue')
  }
]

export default deanRoutes
