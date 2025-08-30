import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const guestBook = sqliteTable("guestBook", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});

// Tasks table for our to-do list
export const tasks = sqliteTable("tasks", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  completed: integer().notNull().default(0), // 0 = false, 1 = true
  createdAt: text().notNull().default(new Date().toISOString()),
  updatedAt: text().notNull().default(new Date().toISOString()),
});
