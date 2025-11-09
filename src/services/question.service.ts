import Question from "../database/models/question.model";
import mongo from "../database/mongo";
import { ObjectId } from "mongodb";
import { QuestionDto } from "../types/dto/question.dto";

const questionService = {
  question_collection: mongo.db.collection("questions"),

  async create(questionDto: QuestionDto) {
    // Validate that correctIndex is within bounds
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
    return question;
  },

  async update(id: string, questionDto: QuestionDto) {
    // Validate that correctIndex is within bounds
    if (questionDto.correctIndex >= questionDto.answers.length) {
      throw new Error("correctIndex is out of bounds");
    }

    return await this.question_collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: {
          text: questionDto.text,
          answers: questionDto.answers,
          correctIndex: questionDto.correctIndex
        }
      },
      { returnDocument: "after" }
    );
  },

  async delete(id: string) {
    await this.question_collection.deleteOne({
      _id: new ObjectId(id),
    });
  },
};

export default questionService;
