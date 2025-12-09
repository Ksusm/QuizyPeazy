import User from "../database/models/user.model";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";
import { RegisterDto } from "../types/dto/register.dto";
import { LoginDto } from "../types/dto/login.dto";
import { UpdateProfileDto } from "../types/dto/updateProfile.dto";
import keycloakService from "./keycloak.service";
import { ApiError } from "../types/api.error";

const authService = {
    get user_collection() {
        if (!mongo.db) throw new ApiError('database error', 'Mongo not connected', 500);
        return mongo.db.collection("users");
    },

    async register(registerDto: RegisterDto) {
        // Check if username already exists in MongoDB
        const existingUser = await this.user_collection.findOne({
            username: registerDto.username,
        });

        if (existingUser) {
            throw new ApiError('conflict', 'Username already exists', 409);
        }

        try {
            // Create user in Keycloak
            const keycloakUser = await keycloakService.createUser(
                registerDto.username,
                registerDto.password
            );

            // Create user metadata in MongoDB
            const user = new User(
                registerDto.username,
                keycloakUser.userId // Store Keycloak user ID
            );

            await this.user_collection.insertOne(user);

            return {
                _id: user._id,
                username: user.username,
                keycloakId: user.keycloakId,
                totalScore: user.totalScore,
                gamesPlayed: user.gamesPlayed,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('bad request', error.message, 400);
        }
    },

    async login(loginDto: LoginDto) {
        try {
            // Authenticate with Keycloak
            const tokens = await keycloakService.loginUser(
                loginDto.username,
                loginDto.password
            );

            // Find user in MongoDB
            const user = await this.user_collection.findOne({
                username: loginDto.username,
            });

            if (!user) {
                throw new ApiError('not found', 'User not found in database', 404);
            }

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                user: {
                    _id: user._id,
                    username: user.username,
                    totalScore: user.totalScore,
                    gamesPlayed: user.gamesPlayed,
                },
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError('unauthorized', 'Invalid username or password', 401);
        }
    },

    async findById(id: string) {
        const user = await this.user_collection.findOne({ _id: new ObjectId(id) });
        return user || null;
    },

    async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
        // Check if new username already exists (if username is being updated)
        if (updateProfileDto.username) {
            const existingUser = await this.user_collection.findOne({
                username: updateProfileDto.username,
                _id: { $ne: new ObjectId(id) },
            });

            if (existingUser) {
                throw new ApiError('conflict', 'Username already exists', 409);
            }
        }

        const result = await this.user_collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateProfileDto },
            { returnDocument: "after" }
        );

        return result || null;
    },
};

export default authService;
