/**
 * @openapi
 * /questions:
 *   post:
 *     summary: Create a new trivia question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "What is the capital of France?"
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Paris", "London", "Berlin", "Madrid"]
 *               correctIndex:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: Question created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: A list of questions
 * /questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single question
 *       404:
 *         description: Question not found
 *       400:
 *         description: Invalid ID
 *   put:
 *     summary: Update a question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               text:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctIndex:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Question updated
 *       404:
 *         description: Question not found
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Question deleted
 *       404:
 *         description: Question not found
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 */
import 'reflect-metadata';
import { Request, Response } from 'express';
import questionService from "../services/question.service";
import { validateBody, validateParams } from "../middleware/validation.middleware";
import { QuestionDto } from "../types/dto/question.dto";
import { IdParam } from "../types/base.dto";

const questionController = {
  async create(req: Request, res: Response) {
    const questionDto = await validateBody(req, QuestionDto);
    const newQuestion = await questionService.create(questionDto);
    res.status(201).json(newQuestion);
  },

  async findAll(req: Request, res: Response) {
    const questions = await questionService.findAll();
    res.status(200).json(questions);
  },

  async findById(req: Request, res: Response) {
    const { id } = await validateParams(req, IdParam);
    const question = await questionService.findById(id);

    if (question === null) {
      res.status(404).send();
      return;
    }

    res.status(200).json(question);
  },

  async update(req: Request, res: Response) {
    const { id } = await validateParams(req, IdParam);
    const questionDto = await validateBody(req, QuestionDto);
    const existingQuestion = await questionService.findById(id);

    if (existingQuestion === null) {
      res.status(404).send();
      return;
    }

    const updatedQuestion = await questionService.update(id, questionDto);
    res.status(200).json(updatedQuestion);
  },

  async delete(req: Request, res: Response) {
    const { id } = await validateParams(req, IdParam);
    await questionService.delete(id);
    res.status(204).send();
  },
};

export default questionController;