export interface GameSession {
    _id?: string;
    roomCode: string;
    players: string[];
    questions: string[];
    currentRound: number;
    scores: { [userId: string]: number };
    status: 'waiting' | 'in-progress' | 'finished';
    answers: { [userId: string]: number[] };
}

export type GameStatus = 'waiting' | 'in-progress' | 'finished';
