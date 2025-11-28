import express from "express";
import { chat } from ".";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = chat(messages);
  result.pipeUIMessageStreamToResponse(res);
});

app.listen(PORT, () => {
  console.info("Running on port: " + PORT);
});
