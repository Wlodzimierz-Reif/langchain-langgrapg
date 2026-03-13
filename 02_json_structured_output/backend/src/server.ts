import express from "express";
import cors from "cors";
import { loadEnv } from "./env";
import { askStructured } from "./ask-core";

loadEnv();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);

app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const { query } = req.body ?? {};
    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: "Query is required" });
    }
    const out = await askStructured(String(query));
    return res.status(200).json(out);
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
