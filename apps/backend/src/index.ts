import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './db/connection';
import { createHealthRoutes } from './presentation/routes/healthRoutes';
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
    }),
);
const appWithRoutes = app
    .route('/api', createHealthRoutes())
    .route('/api', createUserRoutes());

export type AppType = typeof appWithRoutes;

export default app;
