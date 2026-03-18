import { pgTable, uuid, varchar, index, timestamp } from "drizzle-orm/pg-core";

export const Subscriber = pgTable('subscribers', {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("title", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),  
}, (t) => ({
    createdIdx: index("subscribers_created_at_idx").on(t.createdAt),
    emailIdx: index("subscribers_category_id_idx").on(t.email),
}))