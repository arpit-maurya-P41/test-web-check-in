import { NextResponse, NextRequest } from "next/server";
// import { isValidSession } from "@/lib/session";

export async function middleware(req: NextRequest) {
    console.log("middleware");

    const sessionId = req.cookies.get("session_id")?.value;
    console.log("sessionId", sessionId);

    // if (!sessionId) {
    //     return NextResponse.redirect(new URL("/login", req.url));
    // }

    // const hasValidSession = await isValidSession(sessionId);

    // console.log("hasValidSession", hasValidSession);
    // if (!hasValidSession) {
    //     return NextResponse.redirect(new URL("/login", req.url));
    // }

    // console.log("valid session");
    return NextResponse.next();
}

export const config = {
    matcher: "/dashboard", // Ensure it matches an actual route
};
