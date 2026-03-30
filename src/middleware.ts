export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - manifest.json
     * - icons
     * - sw.js (service worker)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-).*)",
  ],
};
