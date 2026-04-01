import type { AccessCode } from '@backend/src/infrastructure/repositories/access-code/IAccessCodeRepository';

export type CreateAccessCodeInput = {
    code: string;
    eventName: string;
    validFrom: string;
    validTo: string;
    createdBy: string;
};

export type CreateAccessCodeResult =
    | { success: true; data: AccessCode }
    | { success: false; error: string };

export interface ICreateAccessCodeUseCase {
    execute(input: CreateAccessCodeInput): Promise<CreateAccessCodeResult>;
}
