<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import config from '@/config';

const router = useRouter();
const auth = useAuth();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`${config.authServiceUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }

    const data = await response.json();

    localStorage.setItem('access_token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(data.user));

    auth.state.authenticated = true;
    auth.state.accessToken = data.accessToken;
    auth.state.refreshToken = data.refreshToken || null;
    auth.state.user = data.user;

    console.log('[LOGIN] Login successful');
    console.log('[LOGIN] Auth state updated:', auth.state);

    // Redirect na lobby
    router.push('/lobby');
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
}

function goToRegister() {
  router.push('/register');
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>🎮 Quizy-Peazy</h1>
        <p>Multiplayer Trivia Game</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <h2>Login</h2>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="register-link">
          Don't have an account?
          <button type="button" @click="goToRegister" class="link-btn">
            Register here
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 400px;
  width: 100%;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.login-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.login-header p {
  margin: 0;
  opacity: 0.9;
}

.login-form {
  padding: 2rem;
}

.login-form h2 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
  margin-left: 0.25rem;
}

.link-btn:hover {
  color: #764ba2;
}
</style>