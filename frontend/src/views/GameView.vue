<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGame } from '@/composables/useGame';
import { useSocket } from '@/composables/useSocket';
import type { Question } from '@/types/Question';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const game = useGame();
const socket = useSocket();

const roomCode = ref(route.params.roomCode as string);
const currentQuestion = ref<Question | null>(null);
const selectedAnswer = ref<number | null>(null);
const hasAnswered = ref(false);
const scores = ref<{ [userId: string]: number }>({});

const currentRound = computed(() => game.currentSession.value?.currentRound || 0);
const totalRounds = computed(() => game.currentSession.value?.questions.length || 5);

async function fetchSessionWithRetry(maxRetries = 3, delayMs = 500): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    console.log(`[DEBUG] Fetching session, attempt ${i + 1}/${maxRetries}`);
    const session = await game.getSession(roomCode.value);

    if (session && (session.status === 'in-progress' || session.currentRound > 0)) {
      console.log('[DEBUG] Session loaded:', session);
      return session;
    }

    console.log(`[DEBUG] Session not ready yet, retrying in ${delayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return null;
}

onMounted(async () => {
  console.log('🎮 [DEBUG] GameView mounted');

  if (!auth.state.authenticated) {
    console.log('[DEBUG] Not authenticated, redirecting to login');
    router.push('/login');
    return;
  }

  console.log('[DEBUG] User authenticated:', auth.state.user);

  const session = await fetchSessionWithRetry();

  if (!session) {
    console.error('[DEBUG] Session not found or not ready, redirecting to lobby');
    alert('Game session not found or not started yet');
    router.push('/lobby');
    return;
  }

  if (session.status === 'finished') {
    console.log('[DEBUG] Game already finished, redirecting to results');
    router.push(`/results/${roomCode.value}`);
    return;
  }

  scores.value = session.scores;
  await loadQuestion();

  await socket.init();
  socket.joinRoom(roomCode.value);

  socket.onScoreUpdate((data) => {
    console.log('[DEBUG] Score updated:', data);
    scores.value = data.scores;
  });

  socket.onRoundChange(async (data) => {
    console.log('[DEBUG] Round changed:', data);
    hasAnswered.value = false;
    selectedAnswer.value = null;

    setTimeout(async () => {
      await game.getSession(roomCode.value);
      await loadQuestion();
    }, 1500);
  });

  socket.onGameEnd((data) => {
    console.log('[DEBUG] Game ended:', data);
    setTimeout(() => {
      router.push(`/results/${roomCode.value}`);
    }, 2000);
  });
});

onUnmounted(() => {
  console.log('[DEBUG] GameView unmounting');
  socket.disconnect();
});

async function loadQuestion() {
  if (!game.currentSession.value || game.currentSession.value.currentRound === 0) {
    console.log('[DEBUG] No current round, skipping question load');
    return;
  }

  const questionId = game.currentSession.value.questions[game.currentSession.value.currentRound - 1];
  if (questionId) {
    console.log('[DEBUG] Loading question:', questionId);
    currentQuestion.value = await game.getQuestion(questionId);
    console.log('[DEBUG] Question loaded:', currentQuestion.value);
  }
}

async function submitAnswer(answerIndex: number) {
  if (hasAnswered.value) return;

  console.log('[DEBUG] Submitting answer:', answerIndex);
  selectedAnswer.value = answerIndex;
  hasAnswered.value = true;

  await game.submitAnswer(
      roomCode.value,
      auth.state.user!._id!,
      answerIndex
  );
}

const sortedScores = computed(() => {
  return Object.entries(scores.value)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
});
</script>

<template>
  <div class="game-view">
    <div class="game-header">
      <div class="round-info">
        Round {{ currentRound }} / {{ totalRounds }}
      </div>
      <div class="room-code">{{ roomCode }}</div>
    </div>

    <div class="game-content">
      <div class="question-section">
        <div v-if="currentQuestion" class="question-card">
          <h2 class="question-text">{{ currentQuestion.text }}</h2>

          <div class="answers-grid">
            <button
                v-for="(answer, index) in currentQuestion.answers"
                :key="index"
                class="answer-btn"
                :class="{
                'selected': selectedAnswer === index,
                'correct': hasAnswered && index === currentQuestion.correctIndex,
                'wrong': hasAnswered && selectedAnswer === index && index !== currentQuestion.correctIndex
              }"
                @click="submitAnswer(index)"
                :disabled="hasAnswered"
            >
              <span class="answer-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="answer-text">{{ answer }}</span>
            </button>
          </div>

          <div v-if="hasAnswered" class="feedback">
            <div v-if="selectedAnswer === currentQuestion.correctIndex" class="correct-feedback">
              ✅ Correct! +10 points
            </div>
            <div v-else class="wrong-feedback">
              ❌ Wrong! Correct answer: {{ String.fromCharCode(65 + currentQuestion.correctIndex) }}
            </div>
          </div>
        </div>

        <div v-else class="loading-question">
          <div class="spinner"></div>
          Loading question...
        </div>
      </div>

      <div class="scoreboard">
        <h3>🏆 Leaderboard</h3>
        <div class="scores-list">
          <div
              v-for="([playerId, score], index) in sortedScores"
              :key="playerId"
              class="score-item"
              :class="{ 'current-user': playerId === auth.state.user?._id }"
          >
            <span class="rank">{{ index + 1 }}</span>
            <span class="player-id">Player {{ playerId.slice(-4) }}</span>
            <span class="score">{{ score }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-view {
  max-width: 1200px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.round-info {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b983;
}

.room-code {
  font-family: monospace;
  font-size: 1.2rem;
  color: #666;
  letter-spacing: 2px;
}

.game-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.question-section {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.question-text {
  font-size: 1.8rem;
  color: #2c3e50;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border: 3px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.answer-btn:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.answer-btn:disabled {
  cursor: not-allowed;
}

.answer-btn.selected {
  border-color: #3498db;
  background: #e3f2fd;
}

.answer-btn.correct {
  border-color: #42b983;
  background: #d4edda;
}

.answer-btn.wrong {
  border-color: #e74c3c;
  background: #f8d7da;
}

.answer-letter {
  width: 40px;
  height: 40px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.answer-text {
  flex: 1;
  text-align: left;
}

.feedback {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
}

.correct-feedback {
  background: #d4edda;
  color: #155724;
}

.wrong-feedback {
  background: #f8d7da;
  color: #721c24;
}

.loading-question {
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

.scoreboard {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.scoreboard h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.score-item.current-user {
  background: #e3f2fd;
  border: 2px solid #42b983;
}

.rank {
  width: 30px;
  height: 30px;
  background: #42b983;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.player-id {
  flex: 1;
  font-weight: 500;
}

.score {
  font-weight: bold;
  color: #42b983;
  font-size: 1.1rem;
}

@media (max-width: 1024px) {
  .game-content {
    grid-template-columns: 1fr;
  }

  .answers-grid {
    grid-template-columns: 1fr;
  }
}
</style>