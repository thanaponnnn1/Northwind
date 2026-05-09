import "dotenv/config"; 
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import { getEnv } from "./lib/env";
import { clerkWebhookHandler } from "./webhooks/clerk";
import path from "path";
import fs from "fs";
import { db } from "./db";  // ← เพิ่ม
import { sql } from "drizzle-orm";  // ← เพิ่ม

const PORT = Number(process.env.PORT) || 10000;

process.on("uncaughtException", (err) => {
  console.error("💥 uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 unhandledRejection:", reason);
  process.exit(1);
});

let env: ReturnType<typeof getEnv>;
try {
  env = getEnv();
  console.log("✅ ENV loaded, PORT =", PORT);
} catch (err) {
  console.error("💥 ENV load failed:", err);
  process.exit(1);
}

const app = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.post("/webhooks/clerk", rawJson, (req, res) => {
  void clerkWebhookHandler(req, res);
});

app.use(express.json());
app.use(cors());

try {
  app.use(clerkMiddleware);
  console.log("✅ Clerk middleware loaded");
} catch (err) {
  console.error("💥 Clerk middleware failed:", err);
  process.exit(1);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const publicDir = path.join(process.cwd(), "public");
console.log("📁 publicDir:", publicDir, "exists:", fs.existsSync(publicDir));

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
      next();
      return;
    }
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// ✅ ทดสอบ DB ก่อน start server
async function startServer() {
  try {
    console.log("🔌 Testing DB connection...");
    await db.execute(sql`SELECT 1`);
    console.log("✅ DB connected");
  } catch (err) {
    console.error("💥 DB connection failed:", err);
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}

void startServer();