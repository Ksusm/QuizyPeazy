import * as mongodb from "mongodb";

class Mongo {
  client: mongodb.MongoClient | null = null;
  db: mongodb.Db | null = null;

  async connect() {
    const url = process.env.MONGO_URL;
    const dbName = process.env.MONGO_DB_NAME;

    if (!url) throw new Error("Mongo URL is not defined");

    this.client = new mongodb.MongoClient(url);
    await this.client.connect();

    this.db = dbName ? this.client.db(dbName) : this.client.db();
    console.log("Connected to Mongo.");
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

export default new Mongo();
