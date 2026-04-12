import type { IOtherItemRepository } from '@backend/src/infrastructure/repositories/other-item/IOtherItemRepository';
import type { IProgramRepository } from '@backend/src/infrastructure/repositories/program/IProgramRepository';
import type { IRoomRepository } from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type { IShopItemRepository } from '@backend/src/infrastructure/repositories/shop-item/IShopItemRepository';
import type { ITimetableRepository } from '@backend/src/infrastructure/repositories/timetable/ITimetableRepository';
import type { ISearchUseCase, SearchUseCaseResult } from './ISearchUseCase';

export class SearchUseCase implements ISearchUseCase {
    constructor(
        private readonly timetableRepository: ITimetableRepository,
        private readonly roomRepository: IRoomRepository,
        private readonly programRepository: IProgramRepository,
        private readonly shopItemRepository: IShopItemRepository,
        private readonly otherItemRepository: IOtherItemRepository,
    ) {}

    async execute(
        keyword: string,
        eventId: string,
    ): Promise<SearchUseCaseResult> {
        try {
            const [timetable, rooms, programs, shopItems, otherItems] =
                await Promise.all([
                    this.timetableRepository.search(keyword, eventId),
                    this.roomRepository.search(keyword, eventId),
                    this.programRepository.search(keyword, eventId),
                    this.shopItemRepository.search(keyword, eventId),
                    this.otherItemRepository.search(keyword, eventId),
                ]);

            return {
                success: true,
                data: { timetable, rooms, programs, shopItems, otherItems },
            };
        } catch {
            return {
                success: false,
                error: '検索処理中にエラーが発生しました',
            };
        }
    }
}
