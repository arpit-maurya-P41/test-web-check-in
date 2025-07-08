import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const removeFutureCheckins = async (
  userId?: number,
  teamIds?: number[] | number
) => {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));

  let teams: number[] = [];
  if (teamIds) {
    teams = Array.isArray(teamIds) ? teamIds : [teamIds];
  }
  if (userId === undefined && teams.length === 0) {
    console.log("Cannot remove check-ins: userId or teamIds must be provided.");
    return;
  }

  await prisma.daily_user_checkins.deleteMany({
    where: {
      ...(userId !== undefined ? { user_id: userId } : {}),
      ...(teams.length > 0 ? { team_id: { in: teams } } : {}),
      OR: [
        {
          check_in_date: {
            gt: todayUTC, 
          },
        },
        {
          check_in_date: todayUTC,
          has_checked_in: false, 
        },
      ],
    },
  });
};
