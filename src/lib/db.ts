// import { Pool } from "pg";

// const pool = new Pool({
//     connectionString: "postgresql://postgres:kqLH!fd6d4yA@slack-check-in-app.crjyupazfotm.ap-south-1.rds.amazonaws.com:5432/postgres",
// });

export const query = async (text: string, params?: unknown[]) => {
    // console.log("Executing query", process.env.DATABASE_URL);
    console.log("Executing query", text, params);

    // const client = await pool.connect();
    // try {
    //     const res = await client.query(text, params);
    //     return res.rows;
    // } catch (err) {
    //     console.error("Error executing query", err);
    // } finally {
    //     client.release();
    // }
};
