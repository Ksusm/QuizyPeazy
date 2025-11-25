import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, {message: "Username must be at least 3 characters long."})
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, {message: "Username must be at least 3 characters long."})
    passwordHash: string;
}