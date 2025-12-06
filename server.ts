import express from "express";
import { chat } from ".";
import { convertToModelMessages } from "ai";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static("public")); // If React is present: Not used static home page
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  const result = chat(convertToModelMessages(messages));
  result.pipeUIMessageStreamToResponse(res);
});

app.listen(PORT, () => {
  console.info("Running on port: http://localhost:" + PORT);
});
