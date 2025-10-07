import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (err) {
    return null;
  }
}
