// Production-ready middleware without Clerk for now
export function middleware() {
  // Basic middleware - can be enhanced with Clerk later
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
