// frontend/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  // Read the HTTP-only cookie
  const token = req.cookies.get("token")?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    // Example: restrict /dashboard routes to certain roles
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const allowedRoles = ["ADMIN", "CUSTOMER"];
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Optionally attach user info to headers for API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (err) {
    // Invalid or expired token → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Only run middleware on dashboard and API routes that need auth
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
