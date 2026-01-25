/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: Create a new game session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hostUserId:
 *                 type: string
 *                 example: "user123"
 *     responses:
 *       201:
 *         description: Session created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 * /sessions/{roomCode}:
 *   get:
 *     summary: Get session by room code
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: roomCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 *       404:
 *         description: Session not found
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Session deleted
 *       404:
 *         description: Session not found
 *       401:
 *         description: Unauthorized
 * /sessions/{roomCode}/join:
 *   post:
 *     summary: Join an existing session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: roomCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user456"
 *     responses:
 *       200:
 *         description: Joined session
 *       404:
 *         description: Session not found
 *       400:
 *         description: Cannot join session
 * /sessions/{roomCode}/start:
 *   post:
 *     summary: Start the game session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game started
 *       404:
 *         description: Session not found
 *       400:
 *         description: Cannot start session
 *       401:
 *         description: Unauthorized
 * /sessions/{roomCode}/answer:
 *   post:
 *     summary: Submit an answer to current question
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: roomCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               answerIndex:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Answer submitted
 *       404:
 *         description: Session not found
 *       400:
 *         description: Invalid answer submission
 */
import 'reflect-metadata';
import { Request, Response } from 'express';
import sessionService from "../services/session.service";
import { validateBody, validateParams } from "../middleware/validation.middleware";
import { CreateSessionDto } from "../types/dto/createSession.dto";
import { JoinSessionDto } from "../types/dto/joinSession.dto";
import { SubmitAnswerDto } from "../types/dto/submitAnswer.dto";
import { RoomCodeParam } from "../types/base.dto";

const sessionController = {
    async create(req: Request, res: Response) {
        const createSessionDto = await validateBody(req, CreateSessionDto);
        const newSession = await sessionService.create(createSessionDto);
        res.status(201).json(newSession);
    },

    async findByRoomCode(req: Request, res: Response) {
        const { roomCode } = await validateParams(req, RoomCodeParam);
        const session = await sessionService.findByRoomCode(roomCode);

        if (session === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(session);
    },

    async join(req: Request, res: Response) {
        const { roomCode } = await validateParams(req, RoomCodeParam);
        const joinSessionDto = await validateBody(req, JoinSessionDto);

        const session = await sessionService.join(roomCode, joinSessionDto);

        if (session === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(session);
    },

    async start(req: Request, res: Response) {
        const { roomCode } = await validateParams(req, RoomCodeParam);
        const session = await sessionService.start(roomCode);

        if (session === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(session);
    },

    async submitAnswer(req: Request, res: Response) {
        const { roomCode } = await validateParams(req, RoomCodeParam);
        const submitAnswerDto = await validateBody(req, SubmitAnswerDto);

        const session = await sessionService.submitAnswer(roomCode, submitAnswerDto);

        if (session === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(session);
    },

    async delete(req: Request, res: Response) {
        const { roomCode } = await validateParams(req, RoomCodeParam);
        await sessionService.delete(roomCode);
        res.status(204).send();
    },
};

export default sessionController;