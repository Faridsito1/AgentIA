import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'landing',
        component: () => import('../views/vistaContratista.vue')
    },
    {
        path: '/supervisor/login',
        name: 'supervisor-login',
        component: () => import('../views/vistaSupervisor.vue')
    },
    {
        path: '/supervisor/dashboard',
        name: 'supervisor-dashboard',
        component: () => import('../views/dashboardSupervisor.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/contratista/plataforma',
        name: 'contratista-plataforma',
        component: () => import('../views/tipoPlanilla.vue')
    },
    {
        path: '/contratista/formulario',
        name: 'contratista-formulario',
        component: () => import('../views/formularioDatos.vue')
    },
    {
        path: '/contratista/confirmacion',
        name: 'contratista-confirmacion',
        component: () => import('../views/confirmarEnvioDatos.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/supervisor/login')
    } else {
        next()
    }
})

export default router
