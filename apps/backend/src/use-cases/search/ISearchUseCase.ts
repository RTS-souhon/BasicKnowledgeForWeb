import type { OtherItem } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type { Program } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type { RoomWithDepartments } from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type { ShopItem } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type { TimetableItem } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';

export type SearchResultData = {
    timetable: TimetableItem[];
    rooms: RoomWithDepartments[];
    programs: Program[];
    shopItems: ShopItem[];
    otherItems: OtherItem[];
};

export type SearchUseCaseResult =
    | { success: true; data: SearchResultData }
    | { success: false; error: string };

export interface ISearchUseCase {
    execute(keyword: string, eventId: string): Promise<SearchUseCaseResult>;
}
