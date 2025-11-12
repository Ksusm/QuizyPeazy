/**
 * @openapi
 * /questions:
 *   post:
 *     summary: Create a new trivia question
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
 *   get:
 *     summary: Get all questions
 *     responses:
 *       200:
 *         description: A list of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   text:
 *                     type: string
 *                   answers:
 *                     type: array
 *                     items:
 *                       type: string
 *                   correctIndex:
 *                     type: integer
 * /questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 text:
 *                   type: string
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: string
 *                 correctIndex:
 *                   type: integer
 *       404:
 *         description: Question not found
 *       400:
 *         description: Invalid ID
 *   put:
 *     summary: Update a question by ID
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
 *   delete:
 *     summary: Delete a question by ID
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
 */
import 'reflect-metadata';
import { Request, Response } from 'express';
import questionService from "../../services/question.service";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { QuestionDto } from "../../types/dto/question.dto";
import { IdParam } from "../../types/base.dto";

const questionController = {
  async create(req: Request, res: Response) {
    try {
      const questionDto = await validateBody(req, QuestionDto);
      const newQuestion = await questionService.create(questionDto);
      res.status(201).json(newQuestion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const questions = await questionService.findAll();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const { id } = await validateParams(req, IdParam);
      const question = await questionService.findById(id);
      if (question === null) {
        res.status(404).send();
        return;
      }
      res.status(200).json(question);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = await validateParams(req, IdParam);
      const questionDto = await validateBody(req, QuestionDto);

      const updatedQuestion = await questionService.update(id, questionDto);

      if (!updatedQuestion) {
        return res.status(404).send();
      }

      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = await validateParams(req, IdParam);
      await questionService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

export default questionController;
