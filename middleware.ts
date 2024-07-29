import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    if (!auth().userId) {
      return auth().redirectToSignIn();
    }

    if (!auth().orgId) {
      if (req.nextUrl.pathname !== "/select-org") {
        const orgSelection = new URL("/select-org", req.url);
        return NextResponse.redirect(orgSelection);
      }
    }
  }

  if (isPublicRoute(req) && auth().userId) {
    if (!auth().orgId) {
      const orgSelection = new URL("/select-org", req.url);
      return NextResponse.redirect(orgSelection);
    } else {
      return NextResponse.redirect(
        new URL(`/organization/${auth().orgId}`, req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
