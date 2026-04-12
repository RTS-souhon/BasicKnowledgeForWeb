import type {
    IRoomRepository,
    UpdateRoomInput as RepositoryUpdateRoomInput,
} from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type {
    IUpdateRoomUseCase,
    UpdateRoomInput,
    UpdateRoomResult,
} from './IUpdateRoomUseCase';

export class UpdateRoomUseCase implements IUpdateRoomUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(input: UpdateRoomInput): Promise<UpdateRoomResult> {
        const payload: RepositoryUpdateRoomInput = {};
        if (input.payload.buildingName !== undefined) {
            payload.buildingName = input.payload.buildingName;
        }
        if (input.payload.floor !== undefined) {
            payload.floor = input.payload.floor;
        }
        if (input.payload.roomName !== undefined) {
            payload.roomName = input.payload.roomName;
        }
        if (input.payload.preDayManagerId !== undefined) {
            payload.preDayManagerId = input.payload.preDayManagerId;
        }
        if (input.payload.preDayPurpose !== undefined) {
            payload.preDayPurpose = input.payload.preDayPurpose;
        }
        if (input.payload.dayManagerId !== undefined) {
            payload.dayManagerId = input.payload.dayManagerId;
        }
        if (input.payload.dayPurpose !== undefined) {
            payload.dayPurpose = input.payload.dayPurpose;
        }
        if (input.payload.notes !== undefined) {
            payload.notes = input.payload.notes;
        }

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                error: '更新項目が指定されていません',
                status: 400,
            };
        }

        try {
            const updated = await this.roomRepository.update(
                input.id,
                input.eventId,
                payload,
            );
            if (!updated) {
                return {
                    success: false,
                    error: '部屋情報が見つかりません',
                    status: 404,
                };
            }
            return { success: true, data: updated };
        } catch {
            return {
                success: false,
                error: '部屋情報の更新中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
