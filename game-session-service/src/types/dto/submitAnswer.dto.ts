import { IsNotEmpty, IsString, IsInt, Min } from "class-validator";

export class SubmitAnswerDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    answerIndex: number;
}