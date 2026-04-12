import type { IRoomRepository } from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type {
    DeleteRoomInput,
    DeleteRoomResult,
    IDeleteRoomUseCase,
} from './IDeleteRoomUseCase';

export class DeleteRoomUseCase implements IDeleteRoomUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(input: DeleteRoomInput): Promise<DeleteRoomResult> {
        try {
            const deleted = await this.roomRepository.delete(
                input.id,
                input.eventId,
            );
            if (!deleted) {
                return {
                    success: false,
                    error: '部屋情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: { id: input.id } };
        } catch {
            return {
                success: false,
                error: '部屋情報の削除中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
