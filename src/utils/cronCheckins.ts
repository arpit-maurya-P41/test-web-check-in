import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const insertDailyUserCheckins = async () => {
  try {
    const roles = await prisma.user_team_role.findMany({
      select: {
        user_id: true,
        team_id: true,
        check_in: true,
      },
    });

    const latestEntry = await prisma.daily_user_checkins.findFirst({
      orderBy: {
        check_in_date: "desc",
      },
      select: {
        check_in_date: true,
      },
    });

    let startDateUTC: Date;
    if (latestEntry) {
      const latestDate = new Date(latestEntry.check_in_date);
      startDateUTC = new Date(Date.UTC(
        latestDate.getUTCFullYear(),
        latestDate.getUTCMonth(),
        latestDate.getUTCDate() + 1
      ));
    } else {
      const today = new Date();
      startDateUTC = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      ));
    }

    const insertDates: Date[] = [];

    for (let i = 0; i < 2; i++) {
      const d = new Date(startDateUTC);
      d.setUTCDate(d.getUTCDate() + i);
      insertDates.push(d);
    }

    for (const date of insertDates) {
      const dateStr = date.toISOString().split("T")[0];

      for (const r of roles) {
        const exists = await prisma.daily_user_checkins.findFirst({
          where: {
            user_id: r.user_id,
            team_id: r.team_id,
            check_in_date: new Date(dateStr),
          },
        });

        if (!exists) {
          await prisma.daily_user_checkins.create({
            data: {
              user_id: r.user_id,
              team_id: r.team_id,
              check_in_date: new Date(dateStr),
              is_active: r.check_in === true,
            },
          });
        }
      }
    }

    console.log(
      "Inserted next 3 days of check-ins starting from:",
      startDateUTC.toDateString()
    );
  } catch (err) {
    console.error("Cron job error:", err);
  }
};

export const insertCheckinsForNewUser = async (
  userIds: number[]| number,
  teamIds: number[]| number
) => {
  try {
    const users = Array.isArray(userIds) ? userIds : [userIds];
    const teams = Array.isArray(teamIds) ? teamIds : [teamIds];

    const roles = await prisma.user_team_role.findMany({
      where: {
        user_id: { in: users },
        team_id: { in: teams },
      },
      select: {
        user_id: true,
        team_id: true,
        check_in: true,
      },
    });

    if (!roles.length) {
      console.log("No roles found for user. Skipping.");
      return;
    }

    const latestEntry = await prisma.daily_user_checkins.findFirst({
      orderBy: { check_in_date: "desc" },
      select: { check_in_date: true },
    });


    if (!latestEntry) {
      console.log("No existing check-in dates found.");
      return;
    }

    const now = new Date();
    const start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));


    const latest = new Date(latestEntry.check_in_date);
    const end = new Date(Date.UTC(
      latest.getUTCFullYear(),
      latest.getUTCMonth(),
      latest.getUTCDate()
    ));
    const insertDates: string[] = [];

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      insertDates.push(dateStr);
    }

    const existingEntries = await prisma.daily_user_checkins.findMany({
      where: {
        user_id: { in: users },
        team_id: { in: teams },
        check_in_date: { in: insertDates.map((d) => new Date(d + "T00:00:00.000Z")) },
      },
      select: {
        team_id: true,
        check_in_date: true,
      },
    });

    const existingMap = new Set(
      existingEntries.map(
        (e) => `${e.team_id}_${e.check_in_date.toISOString().split("T")[0]}`
      )
    );

    const newEntries = [];

    for (const dateStr of insertDates) {
      const date = new Date(dateStr + "T00:00:00.000Z");
      for (const r of roles) {
        const key = `${r.team_id}_${dateStr}`;
        if (!existingMap.has(key)) {
          newEntries.push({
            user_id: r.user_id,
            team_id: r.team_id,
            check_in_date: date,
            is_active: r.check_in,
          });
        }
      }
    }

    if (newEntries.length) {
      await prisma.daily_user_checkins.createMany({
        data: newEntries,
        skipDuplicates: true,
      });
      console.log(`Added check-ins for user`);
    } else {
      console.log(`No new entries needed for user`);
    }
  } catch (err) {
    console.error("Error adding future check-ins for user:", err);
  }
};
