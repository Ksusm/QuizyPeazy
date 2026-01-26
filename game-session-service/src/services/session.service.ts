import Session from "../database/models/session.model";
import mongo from "../database/mongo";
import { CreateSessionDto } from "../types/dto/createSession.dto";
import { JoinSessionDto } from "../types/dto/joinSession.dto";
import { SubmitAnswerDto } from "../types/dto/submitAnswer.dto";
import { ApiError } from "../types/api.error";
import axios from "axios";
import { Config } from "../../config";
import { realtimeClient } from "../utils/realtime.client";

const sessionService = {
    get session_collection() {
        if (!mongo.db) throw new ApiError('database error', 'Mongo not connected', 500);
        return mongo.db.collection("sessions");
    },

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    async create(createSessionDto: CreateSessionDto) {
        const roomCode = this.generateRoomCode();

        const session = new Session(
            roomCode,
            [createSessionDto.hostUserId],
            [],
            0,
            { [createSessionDto.hostUserId]: 0 },
            'waiting',
            {}
        );

        await this.session_collection.insertOne(session);
        return session;
    },

    async findByRoomCode(roomCode: string) {
        const session = await this.session_collection.findOne({ roomCode });
        return session || null;
    },

    async join(roomCode: string, joinSessionDto: JoinSessionDto) {
        const session = await this.findByRoomCode(roomCode);

        if (!session) {
            return null;
        }

        if (session.status !== 'waiting') {
            throw new ApiError('bad request', 'Game already started', 400);
        }

        if (session.players.includes(joinSessionDto.userId)) {
            throw new ApiError('bad request', 'Player already in session', 400);
        }

        session.players.push(joinSessionDto.userId);
        session.scores[joinSessionDto.userId] = 0;

        await this.session_collection.updateOne(
            { roomCode },
            { $set: { players: session.players, scores: session.scores } }
        );

        return session;
    },

    async start(roomCode: string) {
        const session = await this.findByRoomCode(roomCode);

        if (!session) {
            return null;
        }

        if (session.status !== 'waiting') {
            throw new ApiError('bad request', 'Game already started', 400);
        }

        const response = await axios.get(`${Config.questionService.url}/questions`);
        const allQuestions = response.data;

        if (allQuestions.length < 5) {
            throw new ApiError('bad request', 'Not enough questions in database', 400);
        }

        const selectedQuestions = allQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, 5)
            .map((q: any) => q._id);

        await this.session_collection.updateOne(
            { roomCode },
            {
                $set: {
                    questions: selectedQuestions,
                    status: 'in-progress',
                    currentRound: 1
                }
            }
        );

        const updatedSession = await this.findByRoomCode(roomCode);

        // BROADCAST: Game started
        realtimeClient.broadcastGameStart(roomCode, selectedQuestions);

        return updatedSession;
    },

    async submitAnswer(roomCode: string, submitAnswerDto: SubmitAnswerDto) {
        const session = await this.findByRoomCode(roomCode);

        if (!session) {
            return null;
        }

        if (session.status !== 'in-progress') {
            throw new ApiError('bad request', 'Game not in progress', 400);
        }

        if (!session.players.includes(submitAnswerDto.userId)) {
            throw new ApiError('bad request', 'Player not in session', 400);
        }

        if (session.currentRound > session.questions.length) {
            throw new ApiError('bad request', 'Game already finished', 400);
        }

        const currentQuestionId = session.questions[session.currentRound - 1];
        const response = await axios.get(
            `${Config.questionService.url}/questions/${currentQuestionId}`
        );
        const question = response.data;

        if (!session.answers[submitAnswerDto.userId]) {
            session.answers[submitAnswerDto.userId] = [];
        }

        session.answers[submitAnswerDto.userId].push(submitAnswerDto.answerIndex);

        // BROADCAST: Player answered
        realtimeClient.broadcastPlayerAnswer(
            roomCode,
            submitAnswerDto.userId,
            submitAnswerDto.answerIndex
        );

        if (submitAnswerDto.answerIndex === question.correctIndex) {
            session.scores[submitAnswerDto.userId] += 10;
        }

        // BROADCAST: Score updated
        realtimeClient.broadcastScoreUpdate(
            roomCode,
            submitAnswerDto.userId,
            session.scores[submitAnswerDto.userId],
            session.scores
        );

        const allPlayersAnswered = session.players.every(
            playerId => session.answers[playerId]?.length === session.currentRound
        );

        if (allPlayersAnswered) {
            if (session.currentRound >= session.questions.length) {
                session.status = 'finished';

                // BROADCAST: Game ended
                const winner = Object.keys(session.scores).reduce((a, b) =>
                    session.scores[a] > session.scores[b] ? a : b
                );
                realtimeClient.broadcastGameEnd(roomCode, session.scores, winner);
            } else {
                session.currentRound += 1;

                // BROADCAST: Round changed
                realtimeClient.broadcastRoundChange(
                    roomCode,
                    session.currentRound,
                    session.questions.length
                );
            }
        }

        await this.session_collection.updateOne(
            { roomCode },
            {
                $set: {
                    answers: session.answers,
                    scores: session.scores,
                    currentRound: session.currentRound,
                    status: session.status
                }
            }
        );

        return await this.findByRoomCode(roomCode);
    },

    async delete(roomCode: string) {
        await this.session_collection.deleteOne({ roomCode });
    },
};

export default sessionService;