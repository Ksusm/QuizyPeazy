// src/composables/useGame.ts - Vue composable for game session management
import { ref } from 'vue';
import axios from 'axios';
import config from "@/config";
import type { GameSession } from "@/types/GameSession";
import type { Question } from "@/types/Question";

export function useGame() {
    const currentSession = ref<GameSession | null>(null);
    const currentQuestion = ref<Question | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Helper to get token from localStorage
    function getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    // Create a new game session
    async function createSession(hostUserId: string): Promise<GameSession | null> {
        loading.value = true;
        error.value = null;

        try {
            const token = getToken();
            const response = await axios.post(
                `${config.gameServiceUrl}/sessions`,
                { hostUserId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            currentSession.value = response.data;
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create session';
            console.error('Create session error:', err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Get session by room code
    async function getSession(roomCode: string): Promise<GameSession | null> {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.get(
                `${config.gameServiceUrl}/sessions/${roomCode}`
            );
            currentSession.value = response.data;
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Session not found';
            console.error('Get session error:', err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Join an existing session
    async function joinSession(roomCode: string, userId: string): Promise<GameSession | null> {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.post(
                `${config.gameServiceUrl}/sessions/${roomCode}/join`,
                { userId }
            );
            currentSession.value = response.data;
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to join session';
            console.error('Join session error:', err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Start the game
    async function startSession(roomCode: string): Promise<GameSession | null> {
        loading.value = true;
        error.value = null;

        try {
            const token = getToken();
            const response = await axios.post(
                `${config.gameServiceUrl}/sessions/${roomCode}/start`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            currentSession.value = response.data;
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to start session';
            console.error('Start session error:', err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Submit an answer
    async function submitAnswer(roomCode: string, userId: string, answerIndex: number): Promise<GameSession | null> {
        loading.value = true;
        error.value = null;

        try {
            const response = await axios.post(
                `${config.gameServiceUrl}/sessions/${roomCode}/answer`,
                { userId, answerIndex }
            );
            currentSession.value = response.data;
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to submit answer';
            console.error('Submit answer error:', err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    // Get question by ID
    async function getQuestion(questionId: string): Promise<Question | null> {
        try {
            const response = await axios.get(
                `${config.questionServiceUrl}/questions/${questionId}`
            );
            return response.data;
        } catch (err) {
            console.error('Get question error:', err);
            return null;
        }
    }

    // Load current question for the game
    async function loadCurrentQuestion() {
        if (!currentSession.value || currentSession.value.currentRound === 0) {
            return;
        }

        const questionId = currentSession.value.questions[currentSession.value.currentRound - 1];
        if (questionId) {
            currentQuestion.value = await getQuestion(questionId);
        }
    }

    // Delete session
    async function deleteSession(roomCode: string): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const token = getToken();
            await axios.delete(
                `${config.gameServiceUrl}/sessions/${roomCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            currentSession.value = null;
            return true;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete session';
            console.error('Delete session error:', err);
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        currentSession,
        currentQuestion,
        loading,
        error,
        createSession,
        getSession,
        joinSession,
        startSession,
        submitAnswer,
        getQuestion,
        loadCurrentQuestion,
        deleteSession,
    }
}