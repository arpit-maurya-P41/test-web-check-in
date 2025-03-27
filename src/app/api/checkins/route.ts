import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const team = url.searchParams.get("team");
  const smartGoals = url.searchParams.get("smartGoals") === "true";
  const goalsMet = url.searchParams.get("goalsMet") === "true";
  const missedCheckins = url.searchParams.get("missedCheckins") === "true";

  console.log("team", team);
  console.log("smartGoals", smartGoals);
  console.log("goalsMet", goalsMet);
  console.log("missedCheckins", missedCheckins);

  try {
    const checkins = await prisma.checkins.findMany();
    console.log("checkins", checkins);
    // const checkins = await prisma.checkins.findMany({
    //   where: {
    //     slack_channel_id: team || undefined,
    //     is_smart_goal: smartGoals ? true : undefined,
    //     ...(missedCheckins && {
    //       id: {
    //         notIn: (
    //           await prisma.checkouts.findMany({
    //             select: { checkin_id: true },
    //           })
    //         ).map((c) => c.checkin_id),
    //       },
    //     }),
    //   },
    //   include: {
    //     checkout: goalsMet ? { where: { goals_met: true } } : undefined,
    //   },
    // });

    return NextResponse.json([]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
