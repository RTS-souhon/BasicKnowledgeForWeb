import type { OtherItem } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';

export type GetOtherItemsResult =
    | { success: true; data: OtherItem[] }
    | { success: false; error: string };

export interface IGetOtherItemsUseCase {
    execute(eventId: string): Promise<GetOtherItemsResult>;
}
