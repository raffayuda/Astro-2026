import { db } from "@/src/db";
import { asc, eq } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

/**
 * Minimal DB helpers for admin-curated content tables.
 * Each module passes its own table + column refs; this avoids per-table
 * repetition without the fragility of a type-generic factory.
 */

export function listRows(table: any, orderBy?: SQL) {
  return db
    .select()
    .from(table)
    .orderBy(orderBy ?? asc(table.id));
}

export function getRow(table: any, idCol: any, id: string | number) {
  return db
    .select()
    .from(table)
    .where(eq(idCol, id))
    .then((rows: any[]) => rows[0] || null);
}

export function insertRow(table: any, values: Record<string, unknown>) {
  return (db.insert(table) as any)
    .values(values)
    .returning()
    .then((rows: any[]) => rows[0]);
}

export function updateRow(
  table: any,
  idCol: any,
  id: string | number,
  values: Record<string, unknown>,
) {
  return (db.update(table) as any)
    .set(values)
    .where(eq(idCol, id))
    .returning()
    .then((rows: any[]) => rows[0] || null);
}

export function deleteRow(table: any, idCol: any, id: string | number) {
  return (db.delete(table) as any)
    .where(eq(idCol, id))
    .returning()
    .then((rows: any[]) => rows[0] || null);
}
