import mongo from "../database/mongo";
import {RegisterDto} from "../types/dto/register.dto";

const authService = {
    get auth_collection() {
        if (!mongo.db) throw new Error("Mongo not connected");
        return mongo.db.collection("users");
    },

    async create(registerDto: RegisterDto) {

    }
}