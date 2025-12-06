import { Hono } from "hono";
import { chat } from ".";
import { convertToModelMessages } from "ai";

const PORT = process.env.PORT || 3000;
const app = new Hono();

app.use(express.static("public")); // If React is present: Not used static home page
app.use(express.json());

app.post("/api/chat", async (c) => {
  const { messages } = await c.req.json();
  const result = chat(convertToModelMessages(messages));
  return result.toUIMessageStreamResponse();
});

export default app;
// app.listen(PORT, () => {
//   console.info("Running on port: http://localhost:" + PORT);
// });
