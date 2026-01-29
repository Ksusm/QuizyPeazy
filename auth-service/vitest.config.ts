import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv('test', process.cwd(), '');

    for (const key in env) {
        process.env[key] = env[key];
    }

    return {
        test: {
            setupFiles: ['./test/bootstrap.ts'],
            environment: 'node',
            hookTimeout: 30000,
            testTimeout: 10000,
        },
    };
});