import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Config } from '../../config';
import { ApiError } from '../types/api.error';

interface DecodedUser {
    id: string;
    username: string;
    name: string;
    email: string;
    roles: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedUser;
        }
    }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError('unauthorized', 'Missing or invalid authorization header', 401);
        }

        const token = authHeader.substring(7);

        const response = await axios.post(
            `${Config.authService.url}/verify-token`,
            { token },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                validateStatus: (status) => status < 500,
            }
        );

        if (response.status !== 200 || !response.data.valid) {
            throw new ApiError('unauthorized', 'Invalid or expired token', 401);
        }

        req.user = response.data.user;
        next();

    } catch (error: any) {
        if (error instanceof ApiError) {
            return next(error);
        }

        console.error('Auth middleware error:', error.message);
        next(new ApiError('unauthorized', 'Token verification failed', 401));
    }
}

export function hasAnyRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ApiError('unauthorized', 'User not authenticated', 401));
        }

        const hasRole = roles.some((role) => req.user!.roles?.includes(role));

        if (!hasRole) {
            return next(new ApiError('forbidden', 'Insufficient permissions', 403));
        }

        next();
    };
}