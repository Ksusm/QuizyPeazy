/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "alice"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or username already exists
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "alice"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, returns access token
 *       400:
 *         description: Invalid credentials
 * /auth/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
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
 *               username:
 *                 type: string
 *                 example: "alice_updated"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username already exists
 */
import 'reflect-metadata';
import { Request, Response } from 'express';
import authService from "../../../services/auth.service";
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { RegisterDto } from "../../../types/dto/register.dto";
import { LoginDto } from "../../../types/dto/login.dto";
import { UpdateProfileDto } from "../../../types/dto/updateProfile.dto";
import { IdParam } from "../../../types/base.dto";

const authController = {
    async register(req: Request, res: Response) {
        const registerDto = await validateBody(req, RegisterDto);
        const newUser = await authService.register(registerDto);
        res.status(201).json(newUser);
    },

    async login(req: Request, res: Response) {
        const loginDto = await validateBody(req, LoginDto);
        const result = await authService.login(loginDto);
        res.status(200).json(result);
    },

    async getProfile(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const user = await authService.findById(id);

        if (user === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(user);
    },

    async updateProfile(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const updateProfileDto = await validateBody(req, UpdateProfileDto);

        const existingUser = await authService.findById(id);

        if (existingUser === null) {
            res.status(404).send();
            return;
        }

        const updatedUser = await authService.updateProfile(id, updateProfileDto);
        res.status(200).json(updatedUser);
    },
};

export default authController;