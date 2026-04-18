import jwt from "jsonwebtoken";

export type JwtUserPayload = {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
};

export function verifyBearerToken(authHeader: string | null): JwtUserPayload {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Server misconfigured");
  }
  return jwt.verify(token, secret) as JwtUserPayload;
}
