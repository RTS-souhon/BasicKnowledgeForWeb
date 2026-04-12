import type { OtherItem } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';

export type UpdateOtherItemInput = {
    id: string;
    eventId: string;
    payload: {
        title?: string;
        content?: string;
        displayOrder?: number;
    };
};

export type UpdateOtherItemResult =
    | { success: true; data: OtherItem }
    | { success: false; error: string; status?: number };

export interface IUpdateOtherItemUseCase {
    execute(input: UpdateOtherItemInput): Promise<UpdateOtherItemResult>;
}
