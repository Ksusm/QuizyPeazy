export interface Question {
    _id?: string;
    text: string;
    answers: string[];
    correctIndex: number;
}
