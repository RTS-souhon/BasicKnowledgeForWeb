import type { IRoomRepository } from '@backend/src/infrastructure/repositories/room/IRoomRepository';
import type {
    CreateRoomInput,
    CreateRoomResult,
    ICreateRoomUseCase,
} from './ICreateRoomUseCase';

export class CreateRoomUseCase implements ICreateRoomUseCase {
    constructor(private readonly roomRepository: IRoomRepository) {}

    async execute(input: CreateRoomInput): Promise<CreateRoomResult> {
        try {
            const data = await this.roomRepository.create({
                eventId: input.eventId,
                buildingName: input.buildingName,
                floor: input.floor,
                roomName: input.roomName,
                preDayManagerId:
                    input.preDayManagerId === undefined
                        ? null
                        : input.preDayManagerId,
                preDayPurpose:
                    input.preDayPurpose === undefined
                        ? null
                        : input.preDayPurpose,
                dayManagerId: input.dayManagerId,
                dayPurpose: input.dayPurpose,
                notes: input.notes ?? null,
            });
            return { success: true, data };
        } catch {
            return {
                success: false,
                error: '部屋情報の作成中にエラーが発生しました',
                status: 500,
            };
        }
    }
}
