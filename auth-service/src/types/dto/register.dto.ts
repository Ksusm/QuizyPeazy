import { IsNotEmpty, IsString, MinLength, IsOptional, IsArray } from "class-validator";

export class RegisterDto {
    @IsNotEmpty({ message: 'username should not be empty' })
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    username: string;

    @IsNotEmpty({ message: 'password should not be empty' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];
}