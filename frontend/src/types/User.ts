export interface User {
    _id?: string;
    username: string;
    keycloakId: string;
    totalScore: number;
    gamesPlayed: number;
    createdAt?: Date;
}
