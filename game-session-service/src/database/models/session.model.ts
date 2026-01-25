import { ObjectId } from "mongodb";

export default class Session {
    public _id?: ObjectId;

    constructor(
        public roomCode: string,
        public players: string[],
        public questions: string[],
        public currentRound: number,
        public scores: { [userId: string]: number },
        public status: 'waiting' | 'in-progress' | 'finished',
        public answers: { [userId: string]: number[] }
    ) {}
}