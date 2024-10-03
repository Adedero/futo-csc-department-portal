const studentRoutes = [
  {
    path: '',
    name: 'student-dashboard',
    component: () => import('@/views/student/StudentDashboardView.vue')
  },
  {
    path: 'courses',
    name: 'student-courses',
    component: () => import('@/views/student/StudentCoursesView.vue')
  },
  {
    path: 'course-registration/:session/:semester/:level',
    name: 'course-registration',
    component: () => import('@/views/student/StudentCourseRegView.vue')
  },
  {
    path: 'course-registration-details/:id',
    name: 'student-course-reg-details',
    component: () => import('@/views/student/StudentCourseRegDetailsView.vue')
  },
  {
    path: 'results',
    name: 'student-results',
    component: () => import('@/views/student/StudentResultsView.vue')
  },
  {
    path: 'result/:id',
    name: 'student-result-details',
    component: () => import('@/views/student/StudentResultDetailsView.vue')
  },
  {
    path: 'account',
    name: 'student-account',
    component: () => import('@/views/student/StudentAccountView.vue')
  }
]

export default studentRoutes
