import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import adminRoutes from '@/data/routes/admin.routes'
import studentRoutes from '@/data/routes/student.routes'
import staffRoutes from '@/data/routes/staff.routes'
import advisorRoutes from '@/data/routes/advisor.routes'
import hodRoutes from '@/data/routes/hod.routes'
import deanRoutes from '@/data/routes/dean.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue')
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: adminRoutes,
      meta: {
        role: 'ADMIN',
        requiresAuth: true
      }
    },
    {
      path: '/student',
      component: () => import('@/layouts/StudentLayout.vue'),
      children: studentRoutes,
      meta: {
        role: 'STUDENT',
        requiresAuth: true
      }
    },
    {
      path: '/staff',
      component: () => import('@/layouts/StaffLayout.vue'),
      children: staffRoutes,
      meta: {
        role: 'STAFF',
        requiresAuth: true
      }
    },
    {
      path: '/advisor',
      component: () => import('@/layouts/AdvisorLayout.vue'),
      children: advisorRoutes,
      meta: {
        role: 'ADVISOR',
        requiresAuth: true
      }
    },
    {
      path: '/hod',
      component: () => import('@/layouts/HodLayout.vue'),
      children: hodRoutes,
      meta: {
        role: 'HOD',
        requiresAuth: true
      }
    },
    {
      path: '/dean',
      component: () => import('@/layouts/DeanLayout.vue'),
      children: deanRoutes,
      meta: {
        role: 'DEAN',
        requiresAuth: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      beforeEnter: (to, from, next) => {
        next('/404')
      }
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/errors/Error404View.vue')
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/errors/Error403View.vue')
    },
    {
      path: '/500',
      name: '500',
      component: () => import('@/views/errors/Error500View.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const user = JSON.parse(sessionStorage.getItem('user'))
    const token = sessionStorage.getItem('token')

    if (!user || !token) {
      next('/')
    } else {
      if (to.matched.some((record) => record.meta.role && user.role === record.meta.role)) {
        next()
      } else {
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('token')
        next('/')
      }
    }
  } else {
    next()
  }
})

export default router
