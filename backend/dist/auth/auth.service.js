"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const db_1 = require("../db");
const httpError_1 = require("../errors/httpError");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
async function register(email, password) {
    const passwordHash = await (0, password_1.hashPassword)(password);
    try {
        const result = await db_1.pool.query(`INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, role`, [email, passwordHash]);
        const user = result.rows[0];
        return { token: (0, jwt_1.signJwt)({ sub: user.id, role: user.role }) };
    }
    catch (e) {
        if (e.code === "23505") {
            throw new httpError_1.HttpError(409, "Email already exists");
        }
        throw e;
    }
}
async function login(email, password) {
    const result = await db_1.pool.query(`SELECT id, password_hash, role FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];
    if (!user)
        throw new httpError_1.HttpError(401, "Invalid credentials");
    const ok = await (0, password_1.verifyPassword)(password, user.password_hash);
    if (!ok)
        throw new httpError_1.HttpError(401, "Invalid credentials");
    return { token: (0, jwt_1.signJwt)({ sub: user.id, role: user.role }) };
}
