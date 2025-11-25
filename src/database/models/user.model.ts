import {ObjectId} from "mongodb";

export default class User {
    public _id?: ObjectId;

    constructor(
      public username: string,
      public passwordHash: string,
      public totalScore: number = 0,
      public gamesPlayed: number = 0,
      public createdAt: Date = new Date()
    ) {}
}