<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import config from '@/config';

const router = useRouter();

const username = ref('');
const password = ref('');
const email = ref('');
const firstName = ref('');
const lastName = ref('');
const error = ref('');
const loading = ref(false);

async function handleRegister() {
  if (!username.value || !password.value || !email.value) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(`${config.authServiceUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        email: email.value,
        firstName: firstName.value,
        lastName: lastName.value,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data));

    // Redirect to login
    router.push('/login');
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>🎮 Quizy-Peazy</h1>
        <p>Create Your Account</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <h2>Register</h2>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">Username *</label>
          <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Choose a username"
              required
              :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              :disabled="loading"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
                id="firstName"
                v-model="firstName"
                type="text"
                placeholder="First name"
                :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
                id="lastName"
                v-model="lastName"
                type="text"
                placeholder="Last name"
                :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password *</label>
          <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Choose a password"
              required
              :disabled="loading"
          />
        </div>

        <button type="submit" class="register-btn" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <div class="login-link">
          Already have an account?
          <button type="button" @click="goToLogin" class="link-btn">
            Login here
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  max-width: 500px;
  width: 100%;
}

.register-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.register-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}

.register-header p {
  margin: 0;
  opacity: 0.9;
}

.register-form {
  padding: 2rem;
}

.register-form h2 {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.register-btn {
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
  margin-top: 0.5rem;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
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

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>