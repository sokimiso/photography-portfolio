import { NextRequest, NextResponse } from "next/server";

// This is just an example — replace with your DB lookup & password check
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // TODO: Replace with real DB authentication
  if (email === "admin@example.com" && password === "1234") {
    return NextResponse.json({
      token: "fake-jwt-token",
      role: "ADMIN",
    });
  }

  if (email === "customer@example.com" && password === "1234") {
    return NextResponse.json({
      token: "fake-jwt-token",
      role: "CUSTOMER",
    });
  }

  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
