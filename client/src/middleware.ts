import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { handleError } from "./lib/errorhandler";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  try {
    const authCookie = cookies().get("Authorization");
    const path = request.nextUrl.pathname;

    // If user is logged in and tries to access `/login`, redirect them to `/`
    if (authCookie && path === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If user is not logged in and tries to access `/login`, allow access
    if (!authCookie && path === "/login") {
      return NextResponse.next();
    }

    // If user is not logged in and tries to access protected routes, redirect to `/login`
    if (!authCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Validate token
    const token = authCookie.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
      const { payload } = await jose.jwtVerify<{ UserId: string }>(
        token,
        secret
      );
      console.log("Token payload:", payload);

      // Pass UserId to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-UserId", payload.UserId);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch {
      // If token validation fails, redirect to `/login`
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error("Middleware error:", error);
    return handleError(error);
  }
}

export const config = {
  matcher: ["/onboarding", "/apis/retirement", "/dashboard", "/login"],
};
