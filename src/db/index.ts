import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
const queryClient = postgres(connectionString, {
  prepare: false,
  ssl: "require",
  idle_timeout: 30,
  max: 10,
});
export const db = drizzle(queryClient, { schema });
