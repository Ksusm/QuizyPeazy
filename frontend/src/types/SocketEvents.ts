export interface ScoreUpdateEvent {
    userId: string;
    newScore: number;
    scores: { [userId: string]: number };
}

export interface RoundChangeEvent {
    currentRound: number;
    totalRounds: number;
}

export interface GameStartEvent {
    questions: string[];
}

export interface GameEndEvent {
    finalScores: { [userId: string]: number };
    winner: string;
}

export interface PlayerAnswerEvent {
    userId: string;
    answerIndex: number;
}

export interface RoomJoinedEvent {
    roomCode: string;
}
