
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import { cookies } from "next/headers";
// import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
    console.log("Login POST Request", req);

    const data = await prisma.checkins.findMany(); 
    console.log("data", data);
    // try {
    //   const { email, password } = await req.json();
  
    //   // Verify user credentials
    //   const user = await sql`
    //     SELECT id FROM users WHERE email = ${email} AND password = crypt(${password}, password)
    //   `;
  
    //   if (user.rows.length === 0) {
    //     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    //   }
  
    //   const userId = user.rows[0].id;
    //   const sessionId = uuidv4();
    //   const expiresAt = new Date();
    //   expiresAt.setHours(expiresAt.getHours() + 12); // Session expires in 12 hours
  
    //   // Create a session in the database
    //   await sql`
    //     INSERT INTO sessions (id, user_id, expires_at) VALUES (${sessionId}, ${userId}, ${expiresAt})
    //   `;
  
    //   // Store session ID in cookies
    //   cookies().set("session_id", sessionId, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     path: "/",
    //     maxAge: 12 * 60 * 60, // 12 hours
    //   });
  
      return NextResponse.json({ message: "Login successful" });
    // } catch (error) {
    //   console.error("Login error:", error);
    //   return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    // }
  }
  