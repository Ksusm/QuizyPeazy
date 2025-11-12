import Question from "../database/models/question.model";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";
import { QuestionDto } from "../types/dto/question.dto";

const questionService = {
  get question_collection() {
    if (!mongo.db) throw new Error("Mongo not connected");
    return mongo.db.collection("questions");
  },

  async create(questionDto: QuestionDto) {
    if (questionDto.correctIndex >= questionDto.answers.length) {
      throw new Error("correctIndex is out of bounds");
    }
    const question = new Question(
        questionDto.text,
        questionDto.answers,
        questionDto.correctIndex
    );
    await this.question_collection.insertOne(question);
    return question;
  },

  async findAll() {
    return await this.question_collection.find().toArray();
  },

  async findById(id: string) {
    const question = await this.question_collection.findOne({ _id: new ObjectId(id) });
    return question || null;
  },

  async update(id: string, questionDto: QuestionDto) {
    const existingQuestion = await this.question_collection.findOne({ _id: new ObjectId(id) });
    if (!existingQuestion) {
      return null;
    }

    if (questionDto.correctIndex >= questionDto.answers.length) {
      throw new Error("correctIndex is out of bounds");
    }

    const result = await this.question_collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: {
            text: questionDto.text,
            answers: questionDto.answers,
            correctIndex: questionDto.correctIndex
          }
        },
        { returnDocument: "after" }
    );

    return result || null;
  },

  async delete(id: string) {
    await this.question_collection.deleteOne({ _id: new ObjectId(id) });
  },
};

export default questionService;