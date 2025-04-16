import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function DELETE(req: Request) {
    console.log("Detected DELETE request");
    const id = req.url.split("/").pop();

    await prisma.roles.delete({ where: { id: Number(id) } });
    const roles = await prisma.roles.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(roles);
}
