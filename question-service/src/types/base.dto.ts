import { IsNotEmpty, IsMongoId } from "class-validator";

export class IdParam {
    @IsNotEmpty()
    @IsMongoId()
    id: string;
}