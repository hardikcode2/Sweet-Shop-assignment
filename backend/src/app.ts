import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./auth/auth.routes";
import { sweetsRouter } from "./sweets/sweets.routes";
import { HttpError } from "./errors/httpError";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) =>
    res.status(200).json({ ok: true })
  );

  app.use("/api/auth", authRouter);
  app.use("/api/sweets", sweetsRouter); // ✅ THIS WAS MISSING

  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
