import express from "express";
import { chat } from ".";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static("public")); // home page

app.get("/api/chat", async (_, res) => {
  const result = chat("crea un poema sobre robots");
  result.pipeTextStreamToResponse(res);
});

app.listen(PORT, () => {
  console.info("Running on port: http://localhost:" + PORT);
});
