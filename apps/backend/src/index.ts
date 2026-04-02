import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './db/connection';
import { createAccessCodeRoutes } from './presentation/routes/accessCodeRoutes';
import { createAuthRoutes } from './presentation/routes/authRoutes';
import { createHealthRoutes } from './presentation/routes/healthRoutes';
import { createOtherItemRoutes } from './presentation/routes/otherItemRoutes';
import { createProgramRoutes } from './presentation/routes/programRoutes';
import { createRoomRoutes } from './presentation/routes/roomRoutes';
import { createShopItemRoutes } from './presentation/routes/shopItemRoutes';
import { createTimetableRoutes } from './presentation/routes/timetableRoutes';
import { createUserRoutes } from './presentation/routes/userRoutes';

const app = new Hono<{ Bindings: Env }>();

app.use(
    '*',
    cors({
        origin: [
            'https://reitaisai.info',
            'https://dev.reitaisai.info',
            'http://localhost:8771',
        ],
        credentials: true,
    }),
);
const appWithRoutes = app
    .route('/api', createHealthRoutes())
    .route('/api', createUserRoutes())
    .route('/api', createAuthRoutes())
    .route('/api', createAccessCodeRoutes())
    .route('/api', createTimetableRoutes())
    .route('/api', createRoomRoutes())
    .route('/api', createProgramRoutes())
    .route('/api', createShopItemRoutes())
    .route('/api', createOtherItemRoutes());

export type AppType = typeof appWithRoutes;

export default app;
