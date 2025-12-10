import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Wrap NextAuth middleware with your own logic
export default withAuth(
  function middleware(req) {
    // If user is not authenticated, redirect to /login
    if (!req.nextauth?.token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Otherwise continue
    return NextResponse.next();
  },
  {
    // NextAuth options
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/home/:path*"], // protect all /user routes
};