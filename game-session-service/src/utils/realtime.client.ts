import { io as ioClient, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export const realtimeClient = {
    connect(): Promise<void> {
        if (connectionPromise) {
            return connectionPromise;
        }

        if (socket && isConnected) {
            return Promise.resolve();
        }

        connectionPromise = new Promise((resolve, reject) => {
            const realtimeUrl = process.env.REALTIME_SERVICE_URL || 'http://localhost:3004';
            socket = ioClient(realtimeUrl, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            socket.on('connect', () => {
                console.log('Connected to Realtime Service');
                isConnected = true;
                resolve();
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from Realtime Service');
                isConnected = false;
            });

            socket.on('connect_error', (error) => {
                console.error('Realtime Service connection error:', error.message);
                isConnected = false;
                reject(error);
            });

            // Timeout after 5 seconds
            setTimeout(() => {
                if (!isConnected) {
                    reject(new Error('Connection timeout'));
                }
            }, 5000);
        });

        return connectionPromise;
    },

    async ensureConnected(): Promise<void> {
        if (!socket || !isConnected) {
            await this.connect();
        }
    },

    async broadcastScoreUpdate(roomCode: string, userId: string, newScore: number, scores: { [userId: string]: number }) {
        await this.ensureConnected();

        socket?.emit('score-update', {
            roomCode,
            userId,
            newScore,
            scores
        });

        console.log(`Broadcasting score update to room ${roomCode}: ${userId} = ${newScore}`);
    },

    async broadcastRoundChange(roomCode: string, currentRound: number, totalRounds: number) {
        await this.ensureConnected();

        socket?.emit('round-change', {
            roomCode,
            currentRound,
            totalRounds
        });

        console.log(`Broadcasting round change to room ${roomCode}: ${currentRound}/${totalRounds}`);
    },

    async broadcastGameStart(roomCode: string, questions: string[]) {
        await this.ensureConnected();

        socket?.emit('game-start', {
            roomCode,
            questions
        });

        console.log(`Broadcasting game start to room ${roomCode}`);
    },

    async broadcastGameEnd(roomCode: string, finalScores: { [userId: string]: number }, winner: string) {
        await this.ensureConnected();

        socket?.emit('game-end', {
            roomCode,
            finalScores,
            winner
        });

        console.log(`Broadcasting game end to room ${roomCode}, winner: ${winner}`);
    },

    async broadcastPlayerAnswer(roomCode: string, userId: string, answerIndex: number) {
        await this.ensureConnected();

        socket?.emit('player-answer', {
            roomCode,
            userId,
            answerIndex
        });

        console.log(`Broadcasting player answer to room ${roomCode}: ${userId} answered ${answerIndex}`);
    }
};

// Initialize connection on module load
realtimeClient.connect().catch(err => {
    console.error('Failed to initialize realtime client:', err);
});