import { Request, Response, NextFunction } from 'express';

export function apiErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('API Error:', err);

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message || 'An error occurred',
        });
    }

    res.status(500).json({
        error: 'Internal server error',
    });
}