// Temporarily disabled for build
export function middleware() {
  // Middleware will be re-enabled after Clerk setup
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
