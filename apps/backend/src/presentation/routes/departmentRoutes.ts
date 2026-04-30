import { createDatabaseClient, type Env } from '@backend/src/db/connection';
import { DepartmentRepository } from '@backend/src/infrastructure/repositories/departments/DepartmentRepository';
import type { IDepartmentRepository } from '@backend/src/infrastructure/repositories/departments/IDepartmentRepository';
import {
    copyDepartmentsFromEvent,
    createDepartment,
    deleteDepartment,
    getDepartments,
    updateDepartment,
} from '@backend/src/presentation/controllers/departmentController';
import { contentAccessMiddleware } from '@backend/src/presentation/middleware/contentAccessMiddleware';
import { contentEditMiddleware } from '@backend/src/presentation/middleware/contentEditMiddleware';
import { roleGuard } from '@backend/src/presentation/middleware/roleGuard';
import { CopyDepartmentsFromEventUseCase } from '@backend/src/use-cases/department/CopyDepartmentsFromEventUseCase';
import { CreateDepartmentUseCase } from '@backend/src/use-cases/department/CreateDepartmentUseCase';
import { DeleteDepartmentUseCase } from '@backend/src/use-cases/department/DeleteDepartmentUseCase';
import { GetDepartmentsUseCase } from '@backend/src/use-cases/department/GetDepartmentsUseCase';
import { UpdateDepartmentUseCase } from '@backend/src/use-cases/department/UpdateDepartmentUseCase';
import { Hono } from 'hono';
import type { ContentEditVariables } from '../middleware/contentEditMiddleware';

type DepartmentRepositoryFactory = (env: Env) => IDepartmentRepository;

export function createDepartmentRoutes(
    repositoryFactory: DepartmentRepositoryFactory = (env) =>
        new DepartmentRepository(createDatabaseClient(env)),
) {
    const app = new Hono<{ Bindings: Env; Variables: ContentEditVariables }>();
    const ADMIN_ROLES = ['admin'];

    app.get('/departments', contentAccessMiddleware, async (c) => {
        const repository = repositoryFactory(c.env);
        const useCase = new GetDepartmentsUseCase(repository);
        return getDepartments(c, useCase);
    });

    app.post(
        '/departments/copy',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new CopyDepartmentsFromEventUseCase(repository);
            return copyDepartmentsFromEvent(c, useCase);
        },
    );

    app.post(
        '/departments',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new CreateDepartmentUseCase(repository);
            return createDepartment(c, useCase);
        },
    );

    app.put(
        '/departments/:id',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new UpdateDepartmentUseCase(repository);
            return updateDepartment(c, useCase);
        },
    );

    app.delete(
        '/departments/:id',
        contentEditMiddleware,
        roleGuard(ADMIN_ROLES),
        async (c) => {
            const repository = repositoryFactory(c.env);
            const useCase = new DeleteDepartmentUseCase(repository);
            return deleteDepartment(c, useCase);
        },
    );

    return app;
}
