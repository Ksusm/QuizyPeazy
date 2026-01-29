<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    router.push('/lobby');
  }
});

function goToLogin() {
  router.push('/login');
}

function goToRegister() {
  router.push('/register');
}
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1 class="title">🎮 Quizy-Peazy</h1>
      <p class="subtitle">The Ultimate Multiplayer Trivia Experience</p>

      <div class="features">
        <div class="feature">
          <span class="icon">🎯</span>
          <h3>Challenge Friends</h3>
          <p>Create or join rooms and compete in real-time</p>
        </div>
        <div class="feature">
          <span class="icon">⚡</span>
          <h3>Fast-Paced Fun</h3>
          <p>Answer quickly to earn more points</p>
        </div>
        <div class="feature">
          <span class="icon">🏆</span>
          <h3>Climb the Ranks</h3>
          <p>Track your progress and compete for the top spot</p>
        </div>
      </div>

      <div class="cta-buttons">
        <button @click="goToLogin" class="btn btn-primary">
          Login
        </button>
        <button @click="goToRegister" class="btn btn-secondary">
          Register
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.hero {
  text-align: center;
  color: white;
  max-width: 800px;
}

.title {
  font-size: 4rem;
  margin: 0 0 1rem;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.5rem;
  margin: 0 0 3rem;
  opacity: 0.95;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.3s;
}

.feature:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.feature .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.feature h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
}

.feature p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>