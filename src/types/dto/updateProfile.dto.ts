import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class UpdateProfileDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, {message: "Username must be at least 3 characters long."})
    username?: string;
}