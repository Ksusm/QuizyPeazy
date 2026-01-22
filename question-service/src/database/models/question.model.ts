import { ObjectId } from "mongodb";

export default class Question {
  public _id?: ObjectId;

  constructor(
      public text: string,
      public answers: string[],
      public correctIndex: number
  ) {}
}