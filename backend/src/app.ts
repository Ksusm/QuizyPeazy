import { server } from "./api/server";
import mongo from "./database/mongo";

const port = process.env.PORT || 3000;

async function init() {
  console.log("Connecting to Mongo...");
  await mongo.connect();

  server.listen(port, () => {
    console.log(`Quizy-Peazy backend running on port ${port}`);
    console.log(`API Docs: http://localhost:${port}/api-docs`);
  });
}

init();
