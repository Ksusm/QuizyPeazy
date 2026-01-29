// src/composables/useSocket.ts - Vue composable for Socket.IO real-time communication
import { io, Socket } from "socket.io-client";
import config from "@/config";
import type {
    ScoreUpdateEvent,
    RoundChangeEvent,
    GameStartEvent,
    GameEndEvent,
    PlayerAnswerEvent,
    RoomJoinedEvent
} from "@/types/SocketEvents";

export function useSocket() {

    let socket: Socket | null = null;

    // Initialize socket connection
    async function init() {
        socket = io(config.realtimeServiceUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("disconnect", () => {
            console.log('Socket.io: disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.io: connection error', error);
        });

        return new Promise<void>(resolve => {
            socket?.on("connect", () => {
                console.log('Socket.io: connected', socket?.id);
                resolve();
            });
        });
    }

    // Join a game room
    function joinRoom(roomCode: string) {
        console.log('Socket.io: Joining room', roomCode);
        socket?.emit('join-room', roomCode);
    }

    // Leave a game room
    function leaveRoom(roomCode: string) {
        console.log('Socket.io: Leaving room', roomCode);
        socket?.emit('leave-room', roomCode);
    }

    // Subscribe to room joined event
    function onRoomJoined(callback: (data: RoomJoinedEvent) => void) {
        console.log('Socket.io: Subscribing to room-joined event');
        socket?.on('room-joined', callback);
    }

    // Subscribe to score update events
    function onScoreUpdate(callback: (data: ScoreUpdateEvent) => void) {
        console.log('Socket.io: Subscribing to score-updated event');
        socket?.on('score-updated', callback);
    }

    // Subscribe to round change events
    function onRoundChange(callback: (data: RoundChangeEvent) => void) {
        console.log('Socket.io: Subscribing to round-changed event');
        socket?.on('round-changed', callback);
    }

    // Subscribe to game start events
    function onGameStart(callback: (data: GameStartEvent) => void) {
        console.log('Socket.io: Subscribing to game-started event');
        socket?.on('game-started', callback);
    }

    // Subscribe to game end events
    function onGameEnd(callback: (data: GameEndEvent) => void) {
        console.log('Socket.io: Subscribing to game-ended event');
        socket?.on('game-ended', callback);
    }

    // Subscribe to player answer events
    function onPlayerAnswer(callback: (data: PlayerAnswerEvent) => void) {
        console.log('Socket.io: Subscribing to player-answered event');
        socket?.on('player-answered', callback);
    }

    // Disconnect from socket
    function disconnect() {
        socket?.disconnect();
        socket = null;
    }

    // Check if connected
    function isConnected() {
        return socket?.connected ?? false;
    }

    return {
        init,
        joinRoom,
        leaveRoom,
        onRoomJoined,
        onScoreUpdate,
        onRoundChange,
        onGameStart,
        onGameEnd,
        onPlayerAnswer,
        disconnect,
        isConnected,
    }
}