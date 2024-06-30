import { Client } from "pg";

export async function createPgConnection(db = "") {
    try {
        const client = new Client(

            {
                user: process.env.POSTGRESS_USER,
                password: process.env.POSTGRESS_PASSWORD,
                host: process.env.POSTGRESS_HOST,
                port: Number(process.env.POSTGRESS_PORT),
                database: process.env.POSTGRESS_DATABASE_NAME,
            });
        await client.connect();
        return client;

    } catch (err) {
        console.log(err);
        throw new Error(err);

    }
}