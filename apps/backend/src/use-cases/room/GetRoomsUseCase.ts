import type { IRoomRepository } from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type { GetRoomsResult, IGetRoomsUseCase } from './IGetRoomsUseCase';

export class GetRoomsUseCase implements IGetRoomsUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(eventId: string): Promise<GetRoomsResult> {
        try {
            const data = await this.roomRepository.findByEventId(eventId);
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: '部屋割りの取得中にエラーが発生しました',
            };
        }
    }
}
