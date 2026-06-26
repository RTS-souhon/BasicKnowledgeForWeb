import type { OtherItem } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';

export type CreateOtherItemInput = {
    eventId: string;
    title: string;
    content: string;
    imageKey?: string | null;
    displayOrder: number;
    createdBy: string;
};

export type CreateOtherItemResult =
    | { success: true; data: OtherItem }
    | { success: false; error: string; status?: number };

export interface ICreateOtherItemUseCase {
    execute(input: CreateOtherItemInput): Promise<CreateOtherItemResult>;
}
