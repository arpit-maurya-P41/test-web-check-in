"use server";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export async function isValidSession(sessionId: string): Promise<boolean> {
    console.log("Checking isValidSession");
    
    console.log("Deteling expired sessions");

    const data = await prisma.checkins.findMany(); 
    console.log("data", data);

    // await query("DELETE FROM sessions WHERE expires_at < NOW()");

    console.log("Checking session");
    // const data = await query("SELECT * FROM sessions WHERE id = $1", [sessionId]);

    // console.log("data", data);

    return true;
}


// middleware.ts -> session.ts