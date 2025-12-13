"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const httpError_1 = require("../errors/httpError");
const jwt_1 = require("../utils/jwt");
function requireAuth(req, _res, next) {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
        throw new httpError_1.HttpError(401, "Missing token");
    }
    const token = header.replace("Bearer ", "");
    try {
        const payload = (0, jwt_1.verifyJwt)(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch {
        next(new httpError_1.HttpError(401, "Invalid token"));
    }
}
function requireAdmin(req, _res, next) {
    if (!req.user)
        throw new httpError_1.HttpError(401, "Missing token");
    if (req.user.role !== "ADMIN") {
        throw new httpError_1.HttpError(403, "Forbidden");
    }
    next();
}
