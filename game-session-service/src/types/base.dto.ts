import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class IdParam {
    @IsMongoId()
    id: string;
}

export class RoomCodeParam {
    @IsNotEmpty()
    @IsString()
    roomCode: string;
}