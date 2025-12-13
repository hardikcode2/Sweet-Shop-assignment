import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/httpError";
import { verifyJwt } from "../utils/jwt";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing token");
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, "Invalid token"));
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) throw new HttpError(401, "Missing token");
  if (req.user.role !== "ADMIN") {
    throw new HttpError(403, "Forbidden");
  }
  next();
}
