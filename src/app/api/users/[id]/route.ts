import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
    const userId = await Number(req.url.split("/").pop());

    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId, is_active: true },
            select: {
                first_name: true,
                last_name: true,
                title: true,
                location: true,
                timezone: true,
                check_in_time: true,
                check_out_time: true,
                about_you: true,
                is_admin: true
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json(user);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const userId = Number(req.url.split("/").pop());

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const body = await req.json();

        const {
            first_name,
            last_name,
            title,
            location,
            timezone,
            check_in_time,
            check_out_time,
            about_you,
            is_admin
        } = body;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                first_name,
                last_name,
                title,
                location,
                timezone,
                check_in_time,
                check_out_time,
                about_you,
                is_admin
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error in POST:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}