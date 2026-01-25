import { IsNotEmpty, IsString } from "class-validator";

export class JoinSessionDto {
    @IsNotEmpty()
    @IsString()
    userId: string;
}