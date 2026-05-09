import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { getEnv } from "./lib/env";
import { clerkWebhookHandler } from "./webhooks/clerk";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.post("/webhooks/clerk", rawJson, (req, res) => {
  void clerkWebhookHandler(req, res)
  });


app.use(express.json());
app.use(cors());
app.use(clerkMiddleware);



app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
