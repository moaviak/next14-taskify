import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, req) => {
  // if (!auth().userId && !isPublicRoute(req)) {
  //   return auth().redirectToSignIn();
  // }

  // if (auth().userId && !isPublicRoute(req)) {
  //   let path = "/select-org";

  //   if (auth().orgId) {
  //     path = `/organization/${auth().orgId}`;
  //   }

  //   const orgSelection = new URL(path, req.url);

  //   return NextResponse.redirect(orgSelection);
  // }

  // if (
  //   auth().userId &&
  //   !auth().orgId &&
  //   req.nextUrl.pathname !== "/select-org"
  // ) {
  //   const orgSelection = new URL("/select-org", req.url);
  //   return NextResponse.redirect(orgSelection);
  // }

  if (!isPublicRoute(req)) {
    if (!auth().userId) {
      return auth().redirectToSignIn();
    }

    if (!auth().orgId) {
      if (req.nextUrl.pathname !== "/select-org") {
        const orgSelection = new URL("/select-org", req.url);
        return NextResponse.redirect(orgSelection);
      }
    } else {
      if (req.nextUrl.pathname !== `/organization/${auth().orgId}`) {
        return NextResponse.redirect(
          new URL(`/organization/${auth().orgId}`, req.url)
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
