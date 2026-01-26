import { io as ioClient, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const realtimeClient = {
    connect() {
        if (!socket) {
            const realtimeUrl = process.env.REALTIME_SERVICE_URL || 'http://localhost:3004';
            socket = ioClient(realtimeUrl);

            socket.on('connect', () => {
                console.log('Connected to Realtime Service');
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from Realtime Service');
            });

            socket.on('connect_error', (error) => {
                console.error('Realtime Service connection error:', error.message);
            });
        }
        return socket;
    },

    broadcastScoreUpdate(roomCode: string, userId: string, newScore: number, scores: { [userId: string]: number }) {
        if (!socket) this.connect();

        socket?.emit('score-update', {
            roomCode,
            userId,
            newScore,
            scores
        });

        console.log(`Broadcasting score update to room ${roomCode}: ${userId} = ${newScore}`);
    },

    broadcastRoundChange(roomCode: string, currentRound: number, totalRounds: number) {
        if (!socket) this.connect();

        socket?.emit('round-change', {
            roomCode,
            currentRound,
            totalRounds
        });

        console.log(`Broadcasting round change to room ${roomCode}: ${currentRound}/${totalRounds}`);
    },

    broadcastGameStart(roomCode: string, questions: string[]) {
        if (!socket) this.connect();

        socket?.emit('game-start', {
            roomCode,
            questions
        });

        console.log(`Broadcasting game start to room ${roomCode}`);
    },

    broadcastGameEnd(roomCode: string, finalScores: { [userId: string]: number }, winner: string) {
        if (!socket) this.connect();

        socket?.emit('game-end', {
            roomCode,
            finalScores,
            winner
        });

        console.log(`Broadcasting game end to room ${roomCode}, winner: ${winner}`);
    },

    broadcastPlayerAnswer(roomCode: string, userId: string, answerIndex: number) {
        if (!socket) this.connect();

        socket?.emit('player-answer', {
            roomCode,
            userId,
            answerIndex
        });

        console.log(`Broadcasting player answer to room ${roomCode}: ${userId} answered ${answerIndex}`);
    }
};