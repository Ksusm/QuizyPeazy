<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import config from '@/config';

const router = useRouter();

const user = ref<any>(null);
const roomCode = ref('');
const loading = ref(false);
const error = ref('');

onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  } else {
    router.push('/login');
  }
});

async function createRoom() {
  if (!user.value) return;

  loading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${config.gameServiceUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        hostUserId: user.value._id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    const session = await response.json();
    router.push(`/waiting/${session.roomCode}`);
  } catch (err: any) {
    error.value = err.message || 'Failed to create room';
  } finally {
    loading.value = false;
  }
}

async function joinRoom() {
  if (!roomCode.value || !user.value) {
    error.value = 'Please enter a room code';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${config.gameServiceUrl}/sessions/${roomCode.value}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.value._id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to join room');
    }

    router.push(`/waiting/${roomCode.value}`);
  } catch (err: any) {
    error.value = err.message || 'Failed to join room';
  } finally {
    loading.value = false;
  }
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  router.push('/');
}
</script>

<template>
  <div class="lobby">
    <div class="lobby-container">
      <!-- Header with Logout -->
      <div class="lobby-header">
        <h1>🎮 Quizy-Peazy Lobby</h1>
        <button @click="logout" class="logout-btn">
          🚪 Logout
        </button>
      </div>

      <!-- User Info -->
      <div class="user-card" v-if="user">
        <div class="user-avatar">{{ user.username?.[0]?.toUpperCase() || '?' }}</div>
        <div class="user-info">
          <h2>{{ user.username }}</h2>
          <div class="user-stats">
            <span>🏆 {{ user.totalScore || 0 }} points</span>
            <span>🎮 {{ user.gamesPlayed || 0 }} games</span>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Create Room -->
      <div class="action-card">
        <h3>Create New Room</h3>
        <p>Start a new game and invite your friends!</p>
        <button @click="createRoom" class="create-btn" :disabled="loading">
          {{ loading ? 'Creating...' : '🚀 Create Room' }}
        </button>
      </div>

      <!-- Join Room -->
      <div class="action-card">
        <h3>Join Existing Room</h3>
        <p>Enter the room code to join a game</p>
        <div class="join-form">
          <input
              v-model="roomCode"
              type="text"
              placeholder="Enter room code"
              maxlength="6"
              :disabled="loading"
              @keyup.enter="joinRoom"
          />
          <button @click="joinRoom" class="join-btn" :disabled="loading || !roomCode">
            Join
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.lobby-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lobby-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lobby-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
}

.lobby-header .logout-btn {
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
}

.lobby-header .logout-btn:hover {
  background: #c0392b;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.user-stats {
  display: flex;
  gap: 1.5rem;
  color: #666;
  font-size: 0.95rem;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-card h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.action-card p {
  margin: 0 0 1.5rem;
  color: #666;
}

.create-btn {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.join-form {
  display: flex;
  gap: 1rem;
}

.join-form input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
}

.join-form input:focus {
  outline: none;
  border-color: #667eea;
}

.join-btn {
  padding: 1rem 2rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}

.join-btn:hover:not(:disabled) {
  background: #38a372;
}

.join-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>