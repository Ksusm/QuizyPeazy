import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Config } from '../config';
import { socketServer } from './socket/socket.server';
import { config as loadEnv } from 'dotenv';

loadEnv();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: Config.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: Config.corsOrigin,
    credentials: true
}));

console.log('Allowed CORS for', Config.corsOrigin);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Realtime Service - WebSocket server running');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'realtime' });
});

socketServer.init(io);

const PORT = Config.port;

httpServer.listen(PORT, () => {
    console.log(`Realtime Service running on port ${PORT}`);
    console.log(`WebSocket server ready`);
});

export { io };