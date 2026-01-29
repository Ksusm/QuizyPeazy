<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGame } from '@/composables/useGame';
import { useSocket } from '@/composables/useSocket';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const game = useGame();
const socket = useSocket();

const roomCode = ref(route.params.roomCode as string);
const isHost = ref(false);
const starting = ref(false);
let refreshInterval: ReturnType<typeof setInterval> | null = null;

onUnmounted(() => {
  console.log('🧹 [DEBUG] Cleaning up...');
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  socket.leaveRoom(roomCode.value);
  socket.disconnect();
});

onMounted(async () => {
  console.log('🎮 [DEBUG] WaitingRoom mounted');

  if (!auth.state.authenticated) {
    router.push('/login');
    return;
  }

  // Fetch session details
  const session = await game.getSession(roomCode.value);
  if (!session) {
    alert('Room not found');
    router.push('/lobby');
    return;
  }

  isHost.value = session.players[0] === auth.state.user?._id;

  // Connect to WebSocket
  await socket.init();
  socket.joinRoom(roomCode.value);

  // Listen for game start
  socket.onGameStart((data) => {
    console.log('[DEBUG] Game started event received!', data);
    console.log('[DEBUG] Navigating to /game/' + roomCode.value);

    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }

    router.push(`/game/${roomCode.value}`).then(() => {
      console.log('[DEBUG] Navigation successful');
    }).catch((err) => {
      console.error('[DEBUG] Navigation failed:', err);
    });
  });

  refreshInterval = setInterval(async () => {
    await game.getSession(roomCode.value);
  }, 2000);
});

async function startGame() {
  if (!isHost.value) return;

  if (!game.currentSession.value || game.currentSession.value.players.length < 1) {
    alert('Need at least 1 player to start');
    return;
  }

  starting.value = true;
  console.log('[DEBUG] Starting game...');

  try {
    await game.startSession(roomCode.value);
    console.log('[DEBUG] Game started successfully, waiting for socket event...');
  } catch (err: any) {
    console.error('[DEBUG] Error starting game:', err);
    alert(`Failed to start game: ${err.message}`);
    starting.value = false;
  }
}

function copyRoomCode() {
  navigator.clipboard.writeText(roomCode.value);
  alert('Room code copied!');
}

function leaveRoom() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  router.push('/lobby');
}
</script>

<template>
  <div class="waiting-room">
    <div class="waiting-container">
      <div class="room-header">
        <h1>🎮 Waiting Room</h1>
        <span class="code">{{ roomCode }}</span>
        <button class="copy-btn" @click="copyRoomCode">📋 Copy</button>
      </div>
    </div>

    <div class="waiting-content">
      <div class="players-section">
        <h3>Players ({{ game.currentSession.value?.players.length || 0 }})</h3>
        <div class="players-list">
          <div
              v-for="(playerId, index) in game.currentSession.value?.players"
              :key="playerId"
              class="player-item"
          >
            <span class="player-number">{{ index + 1 }}</span>
            <span class="player-name">
              Player {{ playerId.slice(-4) }}
              <span v-if="index === 0" class="host-badge">👑 Host</span>
            </span>
          </div>

          <div v-if="!game.currentSession.value?.players.length" class="empty-state">
            Waiting for players...
          </div>
        </div>
      </div>

      <div class="game-info">
        <div class="info-item">
          <span class="icon">🎮</span>
          <div>
            <div class="info-label">Game Status</div>
            <div class="info-value">{{ game.currentSession.value?.status }}</div>
          </div>
        </div>

        <div class="info-item">
          <span class="icon">❓</span>
          <div>
            <div class="info-label">Questions</div>
            <div class="info-value">5 per game</div>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button
          v-if="isHost"
          class="start-btn"
          @click="startGame"
          :disabled="starting || game.currentSession.value?.status !== 'waiting'"
      >
        {{ starting ? 'Starting...' : '🚀 Start Game' }}
      </button>

      <div v-else class="waiting-message">
        <div class="spinner"></div>
        Waiting for host to start the game...
      </div>

      <button @click="leaveRoom" class="leave-btn">
        ← Leave Room
      </button>
    </div>
  </div>
</template>

<style scoped>
.waiting-room {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.waiting-container {
  max-width: 800px;
  margin: 0 auto;
}

.room-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.room-header h1 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.code {
  display: inline-block;
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  letter-spacing: 0.5rem;
  margin: 0 1rem;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #38a372;
}

.waiting-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.players-section,
.game-info {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.players-section h3,
.game-info h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.player-number {
  width: 32px;
  height: 32px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.player-name {
  flex: 1;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.host-badge {
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item .icon {
  font-size: 2rem;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
}

.info-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.action-buttons {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.start-btn {
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #42b983 0%, #38a372 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.4);
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.waiting-message {
  text-align: center;
  padding: 2rem;
  color: white;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.leave-btn {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.leave-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .waiting-content {
    grid-template-columns: 1fr;
  }

  .code {
    font-size: 2rem;
    letter-spacing: 0.3rem;
  }
}
</style>