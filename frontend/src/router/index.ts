import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import LoginCallbackView from '@/views/LoginCallbackView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LobbyView from '@/views/LobbyView.vue'
import WaitingRoomView from '@/views/WaitingRoomView.vue'
import GameView from '@/views/GameView.vue'
import ResultsView from '@/views/ResultsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      // Route pro OAuth callback
      path: '/login-callback',
      name: 'login-callback',
      component: LoginCallbackView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView,
      meta: { requiresAuth: true },
    },
    {
      path: '/waiting/:roomCode',
      name: 'waiting',
      component: WaitingRoomView,
      meta: { requiresAuth: true },
    },
    {
      path: '/game/:roomCode',
      name: 'game',
      component: GameView,
      meta: { requiresAuth: true },
    },
    {
      path: '/results/:roomCode',
      name: 'results',
      component: ResultsView,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = useAuth();

  // Allow login-callback without auth check
  if (to.path === '/login-callback') {
    next();
    return;
  }

  if (to.meta.requiresAuth && !auth.state.authenticated) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && auth.state.authenticated) {
    next('/lobby');
  } else {
    next();
  }
});

export default router