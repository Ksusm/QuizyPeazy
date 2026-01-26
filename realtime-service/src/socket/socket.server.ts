import { Server, Socket } from 'socket.io';
import {
    ScoreUpdateEvent,
    RoundChangeEvent,
    GameStartEvent,
    GameEndEvent,
    PlayerAnswerEvent
} from '../types/events';

let io: Server;
let sockets: { [socketId: string]: Socket } = {};
let roomSubscriptions: Map<string, Array<string>> = new Map();

export const socketServer = {
    init(socketIo: Server) {
        io = socketIo;

        io.on('connection', (socket: Socket) => {
            console.log('Socket.io: User ' + socket.id + ' connected');
            sockets[socket.id] = socket;

            socket.on('join-room', (roomCode: string) => {
                this.subscribeToRoom(socket.id, roomCode);
            });

            socket.on('disconnect', () => {
                console.log('Socket.io: User ' + socket.id + ' disconnected');
                delete sockets[socket.id];
                this.unsubscribeFromAllRooms(socket.id);
            });
        });
    },

    send(socketId: string, event: string, data: any) {
        if (sockets[socketId]) {
            console.log('Socket.io: Sending to ' + socketId + ' event ' + event, data);
            sockets[socketId].emit(event, data);
        }
    },

    subscribeToRoom(socketId: string, roomCode: string) {
        console.log('Socket.io: User ' + socketId + ' subscribed to room ' + roomCode);

        if (!roomSubscriptions.has(roomCode)) {
            roomSubscriptions.set(roomCode, []);
        }

        const subscribers = roomSubscriptions.get(roomCode)!;
        if (!subscribers.includes(socketId)) {
            subscribers.push(socketId);
        }

        this.send(socketId, 'room-joined', { roomCode });
    },

    unsubscribeFromAllRooms(socketId: string) {
        roomSubscriptions.forEach((subscribers, roomCode) => {
            const index = subscribers.indexOf(socketId);
            if (index > -1) {
                subscribers.splice(index, 1);
                console.log('Socket.io: User ' + socketId + ' unsubscribed from room ' + roomCode);
            }
        });
    },

    broadcastToRoom(roomCode: string, event: string, data: any) {
        console.log('Socket.io: Broadcasting to room ' + roomCode + ' event ' + event, data);
        roomSubscriptions.get(roomCode)?.forEach(socketId =>
            this.send(socketId, event, data)
        );
    },

    broadcastScoreUpdate(data: ScoreUpdateEvent) {
        console.log('Socket.io: Broadcasting score update for room ' + data.roomCode, data);
        this.broadcastToRoom(data.roomCode, 'score-updated', {
            userId: data.userId,
            newScore: data.newScore,
            scores: data.scores
        });
    },

    broadcastRoundChange(data: RoundChangeEvent) {
        console.log('Socket.io: Broadcasting round change for room ' + data.roomCode, data);
        this.broadcastToRoom(data.roomCode, 'round-changed', {
            currentRound: data.currentRound,
            totalRounds: data.totalRounds
        });
    },

    broadcastGameStart(data: GameStartEvent) {
        console.log('Socket.io: Broadcasting game start for room ' + data.roomCode, data);
        this.broadcastToRoom(data.roomCode, 'game-started', {
            questions: data.questions
        });
    },

    broadcastGameEnd(data: GameEndEvent) {
        console.log('Socket.io: Broadcasting game end for room ' + data.roomCode, data);
        this.broadcastToRoom(data.roomCode, 'game-ended', {
            finalScores: data.finalScores,
            winner: data.winner
        });
    },

    broadcastPlayerAnswer(data: PlayerAnswerEvent) {
        console.log('Socket.io: Broadcasting player answer for room ' + data.roomCode, data);
        this.broadcastToRoom(data.roomCode, 'player-answered', {
            userId: data.userId,
            answerIndex: data.answerIndex
        });
    }
};