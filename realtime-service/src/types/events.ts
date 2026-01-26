export interface JoinRoomEvent {
    roomCode: string;
    userId: string;
    username: string;
}

export interface ScoreUpdateEvent {
    roomCode: string;
    userId: string;
    newScore: number;
    scores: { [userId: string]: number };
}

export interface RoundChangeEvent {
    roomCode: string;
    currentRound: number;
    totalRounds: number;
}

export interface GameStartEvent {
    roomCode: string;
    questions: string[];
}

export interface GameEndEvent {
    roomCode: string;
    finalScores: { [userId: string]: number };
    winner: string;
}

export interface PlayerAnswerEvent {
    roomCode: string;
    userId: string;
    answerIndex: number;
}