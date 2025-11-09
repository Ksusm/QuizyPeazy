import { IsNotEmpty, IsArray, IsString, IsInt, Min, ArrayMinSize } from "class-validator";

export class QuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  answers: string[];

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  correctIndex: number;
}