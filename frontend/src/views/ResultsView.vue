<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGame } from '@/composables/useGame';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const game = useGame();

const roomCode = ref(route.params.roomCode as string);
const loading = ref(true);

onMounted(async () => {
  console.log('[DEBUG] ResultsView mounted');

  if (!auth.state.authenticated) {
    console.log('[DEBUG] Not authenticated, redirecting to login');
    router.push('/login');
    return;
  }

  console.log('[DEBUG] User authenticated:', auth.state.user);

  // Fetch final session state
  const session = await game.getSession(roomCode.value);
  if (!session) {
    console.log('[DEBUG] Session not found, redirecting to lobby');
    router.push('/lobby');
    return;
  }

  console.log('[DEBUG] Session loaded:', session);
  loading.value = false;
});

const sortedScores = computed(() => {
  if (!game.currentSession.value) return [];

  return Object.entries(game.currentSession.value.scores)
      .sort(([, a], [, b]) => b - a)
      .map(([playerId, score], index) => ({
        playerId,
        score,
        rank: index + 1,
        isWinner: index === 0,
        isCurrentUser: playerId === auth.state.user?._id
      }));
});

const winner = computed(() => sortedScores.value[0]);
const currentUserRank = computed(() => {
  return sortedScores.value.find(s => s.isCurrentUser)?.rank || 0;
});

function playAgain() {
  console.log('🎮 [DEBUG] Play again clicked');
  router.push('/lobby');
}

function backToLobby() {
  console.log('[DEBUG] Back to lobby clicked');
  router.push('/lobby');
}
</script>

<template>
  <div class="results-view">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Loading results...
    </div>

    <div v-else class="results-content">
      <!-- Winner Announcement -->
      <div class="winner-section">
        <div class="trophy">🏆</div>
        <h1 class="winner-title">
          <span v-if="winner.isCurrentUser">You Won!</span>
          <span v-else>Winner</span>
        </h1>
        <div class="winner-name">
          Player {{ winner.playerId.slice(-4) }}
        </div>
        <div class="winner-score">{{ winner.score }} points</div>
      </div>

      <!-- Your Performance -->
      <div class="your-performance">
        <h3>Your Performance</h3>
        <div class="performance-stats">
          <div class="stat">
            <div class="stat-value">{{ currentUserRank }}</div>
            <div class="stat-label">Your Rank</div>
          </div>
          <div class="stat">
            <div class="stat-value">
              {{ sortedScores.find(s => s.isCurrentUser)?.score || 0 }}
            </div>
            <div class="stat-label">Your Score</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ game.currentSession.value?.questions.length || 0 }}</div>
            <div class="stat-label">Questions</div>
          </div>
        </div>
      </div>

      <!-- Final Standings -->
      <div class="standings">
        <h3>Final Standings</h3>
        <div class="standings-list">
          <div
              v-for="player in sortedScores"
              :key="player.playerId"
              class="standing-item"
              :class="{
              'winner': player.isWinner,
              'current-user': player.isCurrentUser
            }"
          >
            <div class="rank-badge" :class="`rank-${player.rank}`">
              <span v-if="player.rank === 1">🥇</span>
              <span v-else-if="player.rank === 2">🥈</span>
              <span v-else-if="player.rank === 3">🥉</span>
              <span v-else>{{ player.rank }}</span>
            </div>

            <div class="player-info">
              <div class="player-name">
                Player {{ player.playerId.slice(-4) }}
                <span v-if="player.isCurrentUser" class="you-badge">You</span>
              </div>
              <div class="player-score">{{ player.score }} points</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        <button class="primary-btn" @click="playAgain">
          🎮 Play Again
        </button>
        <button class="secondary-btn" @click="backToLobby">
          ← Back to Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-view {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.winner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.trophy {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.winner-title {
  font-size: 2.5rem;
  margin: 0.5rem 0;
  font-weight: bold;
}

.winner-name {
  font-size: 1.8rem;
  margin: 0.5rem 0;
  opacity: 0.95;
}

.winner-score {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 1rem;
}

.your-performance {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.your-performance h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.stat {
  text-align: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #42b983;
}

.stat-label {
  color: #666;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.standings {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.standings h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.standings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.standing-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.3s;
}

.standing-item.current-user {
  background: #e3f2fd;
  border: 2px solid #42b983;
}

.standing-item.winner {
  background: linear-gradient(135deg, #fff9e6 0%, #ffe6a7 100%);
}

.rank-badge {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  background: #42b983;
  color: white;
  flex-shrink: 0;
}

.rank-badge.rank-1 {
  background: transparent;
  font-size: 2.5rem;
}

.rank-badge.rank-2 {
  background: transparent;
  font-size: 2.5rem;
}

.rank-badge.rank-3 {
  background: transparent;
  font-size: 2.5rem;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: bold;
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.you-badge {
  background: #42b983;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.player-score {
  color: #666;
  font-size: 1rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.primary-btn, .secondary-btn {
  padding: 1.25rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn {
  background: #42b983;
  color: white;
}

.primary-btn:hover {
  background: #38a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.secondary-btn {
  background: white;
  color: #2c3e50;
  border: 2px solid #ddd;
}

.secondary-btn:hover {
  background: #f8f9fa;
  border-color: #42b983;
}

@media (max-width: 768px) {
  .performance-stats {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>