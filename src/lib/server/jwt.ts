import jwt from "jsonwebtoken";

const JWT_SECRET = (process.env.JWT_SECRET as string) || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as string) || "7d";

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getTokenFromAuthorizationHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
