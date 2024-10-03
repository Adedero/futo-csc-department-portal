const advisorRoutes = [
  {
    path: '',
    name: 'advisor-dashboard',
    component: () => import('@/views/advisor/AdvisorDashboardView.vue')
  },
  {
    path: 'results',
    name: 'advisor-results',
    component: () => import('@/views/advisor/AdvisorResultsView.vue')
  },
  {
    path: 'class',
    name: 'advisor-class',
    component: () => import('@/views/advisor/class/AdvisorClassView.vue')
  },
  {
    path: 'add-class-result/:staffId/:session/:semester/:level/:course',
    name: 'advisor-add-class-result',
    component: () => import('@/views/advisor/class/AdvisorAddClassResultView.vue')
  },
  {
    path: 'edit-class-result/:resultId',
    name: 'advisor-edit-class-result',
    component: () => import('@/views/advisor/class/AdvisorEditClassResultView.vue')
  },
  {
    path: 'view-class-result-all-courses/:session/:semester/:level/',
    name: 'advisor-class-all-courses-result',
    component: () => import('@/views/advisor/class/AdvisorClassAllCoursesView.vue')
  },
  {
    path: 'view-class-result/:session/:semester/:level/:course',
    name: 'advisor-class-ogr-result',
    component: () => import('@/views/advisor/class/AdvisorClassOgrResultView.vue')
  },
  {
    path: 'student/:id',
    name: 'advisor-class-student',
    component: () => import('@/views/advisor/class/AdvisorClassStudentView.vue')
  },
  {
    path: 'student-transcripts/:id',
    name: 'advisor-student-transcripts',
    component: () => import('@/views/advisor/class/AdvisorStudentTranscriptsView.vue')
  },
  {
    path: 'student-course-registration-details/:id',
    name: 'advisor-student-course-registration-details',
    component: () => import('@/views/advisor/class/AdvisorStudentCourseRegDetailsView.vue')
  },
  {
    path: 'view-result/:resultId',
    name: 'advisor-ogr-result',
    component: () => import('@/views/advisor/AdvisorOgrResultView.vue')
  },
  {
    path: 'add-result/:staffId/:session/:semester/:level/:course',
    name: 'advisor-add-result',
    component: () => import('@/views/advisor/AdvisorAddResultView.vue')
  },
  {
    path: 'edit-result/:resultId',
    name: 'advisor-edit-result',
    component: () => import('@/views/advisor/AdvisorEditResultView.vue')
  },
  {
    path: 'account',
    name: 'advisor-account',
    component: () => import('@/views/advisor/AdvisorAccountView.vue')
  }
]

export default advisorRoutes
