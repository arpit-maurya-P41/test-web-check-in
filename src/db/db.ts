import { Pool } from "pg";

export const connection = new Pool({
    connectionString: "postgresql://postgres:kqLH!fd6d4yA@slack-check-in-app.crjyupazfotm.ap-south-1.rds.amazonaws.com:5432/postgres",
});

