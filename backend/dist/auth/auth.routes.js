"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_schemas_1 = require("./auth.schemas");
const authService = __importStar(require("./auth.service"));
const httpError_1 = require("../errors/httpError");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", async (req, res, next) => {
    try {
        const parsed = auth_schemas_1.registerSchema.safeParse(req.body);
        if (!parsed.success)
            throw new httpError_1.HttpError(400, "Invalid request body");
        const result = await authService.register(parsed.data.email, parsed.data.password);
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post("/login", async (req, res, next) => {
    try {
        const parsed = auth_schemas_1.loginSchema.safeParse(req.body);
        if (!parsed.success)
            throw new httpError_1.HttpError(400, "Invalid request body");
        const result = await authService.login(parsed.data.email, parsed.data.password);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
});
