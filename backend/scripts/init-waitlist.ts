import * as dotenv from 'dotenv';
dotenv.config();
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Running migration manual script...');
    try {
        await db.execute(sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email varchar(255) NOT NULL UNIQUE,
          created_at timestamp DEFAULT now() NOT NULL
        );
      `);
        console.log('Waitlist table created or already exists.');
    } catch (e: any) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

main();
