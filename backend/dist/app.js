"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = require("./auth/auth.routes");
const httpError_1 = require("./errors/httpError");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
    app.use("/api/auth", auth_routes_1.authRouter);
    app.use((err, _req, res, _next) => {
        if (err instanceof httpError_1.HttpError) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    });
    return app;
}
