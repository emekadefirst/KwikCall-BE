import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const Category = pgTable('categories', {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
