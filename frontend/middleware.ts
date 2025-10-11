import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: "ADMIN" | "CUSTOMER";
    };

    const { pathname } = req.nextUrl;

    // Restrict /dashboard to ADMINs
    if (pathname.startsWith("/dashboard") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Restrict /my-dashboard to CUSTOMERS
    if (pathname.startsWith("/my-dashboard") && payload.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Attach headers for API usage
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-dashboard/:path*", "/api/:path*"],
};
