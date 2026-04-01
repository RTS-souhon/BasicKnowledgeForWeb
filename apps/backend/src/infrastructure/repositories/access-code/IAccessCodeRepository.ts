import type { accessCodes } from '@backend/src/db/schema';

export type AccessCode = typeof accessCodes.$inferSelect;

export type NewAccessCode = {
    code: string;
    eventName: string;
    validFrom: Date;
    validTo: Date;
    createdBy: string;
};

export interface IAccessCodeRepository {
    findAll(): Promise<AccessCode[]>;
    findByCode(code: string): Promise<AccessCode | null>;
    create(input: NewAccessCode): Promise<AccessCode>;
    deleteById(id: string): Promise<boolean>;
}
